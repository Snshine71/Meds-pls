import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './db';
import { projectRepo, backupRepo } from './repositories';
import { getFormatDef } from '@/config/formats';
import { newId, now } from '@/lib/id';
import type { Unit } from './types';

async function clearAll() {
  await Promise.all([
    db.projects.clear(),
    db.bibleDocs.clear(),
    db.units.clear(),
    db.generations.clear(),
    db.settings.clear(),
  ]);
}

beforeEach(async () => {
  await clearAll();
});

describe('projectRepo', () => {
  it('creates a novel with format defaults and station 0 active', async () => {
    const p = await projectRepo.create({ name: 'The Long Fall', format: 'novel' });
    const fmt = getFormatDef('novel');
    expect(p.name).toBe('The Long Fall');
    expect(p.format).toBe('novel');
    expect(p.targets.words).toBe(fmt.targets.defaultWords);
    expect(p.targets.units).toBe(fmt.targets.defaultUnits);
    expect(p.currentStation).toBe(0);
    expect(p.stationStatus[0]).toBe('active');
    expect(p.stationStatus[1]).toBe('locked');
  });

  it('applies picture-book defaults', async () => {
    const p = await projectRepo.create({ name: 'Bunny', format: 'picture-book' });
    const fmt = getFormatDef('picture-book');
    expect(p.targets.units).toBe(fmt.targets.defaultUnits);
    expect(p.targets.words).toBe(fmt.targets.defaultWords);
  });

  it('falls back to "Untitled Book" for a blank name', async () => {
    const p = await projectRepo.create({ name: '   ', format: 'novel' });
    expect(p.name).toBe('Untitled Book');
  });

  it('lists projects most-recently-updated first', async () => {
    const a = await projectRepo.create({ name: 'A', format: 'novel' });
    await new Promise((r) => setTimeout(r, 2));
    const b = await projectRepo.create({ name: 'B', format: 'novel' });
    const list = await projectRepo.list();
    expect(list.map((p) => p.id)).toEqual([b.id, a.id]);
  });

  it('renames and bumps updatedAt', async () => {
    const p = await projectRepo.create({ name: 'Old', format: 'novel' });
    const updated = await projectRepo.rename(p.id, 'New Title');
    expect(updated?.name).toBe('New Title');
    expect(updated!.updatedAt).toBeGreaterThanOrEqual(p.updatedAt);
  });

  it('cascade-deletes bible docs, units, and generations', async () => {
    const p = await projectRepo.create({ name: 'Doomed', format: 'novel' });
    const unit: Unit = {
      id: newId(),
      projectId: p.id,
      order: 0,
      kind: 'chapter',
      title: 'Ch 1',
      beatRef: '',
      draft: '',
      status: 'empty',
      wordCount: 0,
      updatedAt: now(),
    };
    await db.units.add(unit);
    await db.generations.add({
      id: newId(),
      unitId: unit.id,
      createdAt: now(),
      kind: 'draft',
      content: 'x',
      model: 'claude-sonnet-4-6',
    });
    await db.bibleDocs.add({
      id: newId(),
      projectId: p.id,
      type: 'brief',
      title: 'Brief',
      content: '',
      includeInPrompts: true,
      updatedAt: now(),
    });

    await projectRepo.remove(p.id);

    expect(await db.projects.get(p.id)).toBeUndefined();
    expect(await db.units.where('projectId').equals(p.id).count()).toBe(0);
    expect(await db.bibleDocs.where('projectId').equals(p.id).count()).toBe(0);
    expect(await db.generations.where('unitId').equals(unit.id).count()).toBe(0);
  });

  it('computes approved progress', async () => {
    const p = await projectRepo.create({ name: 'Prog', format: 'novel' });
    expect(await projectRepo.approvedProgress(p.id)).toBe(0);
    const mk = (order: number, status: Unit['status']): Unit => ({
      id: newId(),
      projectId: p.id,
      order,
      kind: 'chapter',
      title: `Ch ${order}`,
      beatRef: '',
      draft: '',
      status,
      wordCount: 0,
      updatedAt: now(),
    });
    await db.units.bulkAdd([mk(0, 'approved'), mk(1, 'approved'), mk(2, 'empty'), mk(3, 'review')]);
    expect(await projectRepo.approvedProgress(p.id)).toBe(50);
  });
});

describe('backupRepo', () => {
  it('exports and re-imports a project as an independent copy', async () => {
    const p = await projectRepo.create({ name: 'Backup Me', format: 'novel' });
    await db.bibleDocs.add({
      id: newId(),
      projectId: p.id,
      type: 'brief',
      title: 'Brief',
      content: '# premise',
      includeInPrompts: true,
      updatedAt: now(),
    });
    const unit: Unit = {
      id: newId(),
      projectId: p.id,
      order: 0,
      kind: 'chapter',
      title: 'Ch 1',
      beatRef: 'beat-1',
      draft: 'Once upon a time.',
      status: 'approved',
      wordCount: 4,
      updatedAt: now(),
    };
    await db.units.add(unit);
    await db.generations.add({
      id: newId(),
      unitId: unit.id,
      createdAt: now(),
      kind: 'draft',
      content: 'Once upon a time.',
      model: 'claude-sonnet-4-6',
    });

    const bundle = await backupRepo.exportProject(p.id);
    expect(bundle.version).toBe(1);
    expect(bundle.bibleDocs).toHaveLength(1);
    expect(bundle.units).toHaveLength(1);
    expect(bundle.generations).toHaveLength(1);

    const newProjectId = await backupRepo.importProject(bundle);
    expect(newProjectId).not.toBe(p.id);

    // Both the original and the imported copy exist independently.
    expect(await db.projects.count()).toBe(2);
    const importedUnits = await db.units.where('projectId').equals(newProjectId).toArray();
    expect(importedUnits).toHaveLength(1);
    expect(importedUnits[0].id).not.toBe(unit.id);
    expect(importedUnits[0].draft).toBe('Once upon a time.');
    // Generation was re-linked to the new unit id.
    const importedGens = await db.generations
      .where('unitId')
      .equals(importedUnits[0].id)
      .toArray();
    expect(importedGens).toHaveLength(1);
  });

  it('rejects an invalid bundle', async () => {
    await expect(
      backupRepo.importProject({ version: 2 } as never),
    ).rejects.toThrow(/Invalid project file/);
  });
});
