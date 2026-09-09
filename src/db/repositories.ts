import { db } from './db';
import type {
  Project,
  BibleDoc,
  Unit,
  Generation,
  ProjectFormat,
  StationStatus,
} from './types';
import { newId, now } from '@/lib/id';
import { getFormatDef } from '@/config/formats';

/**
 * Repository layer over Dexie. Pure data access — no UI, no store. These are
 * the functions covered by the Vitest suite (spec §2 testing requirement).
 */

export interface CreateProjectInput {
  name: string;
  format: ProjectFormat;
  genre?: string;
  audience?: string;
  targetWords?: number;
  targetUnits?: number;
}

/** Fresh station status map: station 0 active, everything else locked. */
function initialStationStatus(): Record<number, StationStatus> {
  return { 0: 'active', 1: 'locked', 2: 'locked', 3: 'locked', 4: 'locked', 5: 'locked' };
}

export const projectRepo = {
  async list(): Promise<Project[]> {
    // Most-recently-touched first.
    return db.projects.orderBy('updatedAt').reverse().toArray();
  },

  async get(id: string): Promise<Project | undefined> {
    return db.projects.get(id);
  },

  async create(input: CreateProjectInput): Promise<Project> {
    const fmt = getFormatDef(input.format);
    const ts = now();
    const project: Project = {
      id: newId(),
      name: input.name.trim() || 'Untitled Book',
      format: input.format,
      genre: input.genre ?? '',
      audience: input.audience ?? '',
      targets: {
        words: input.targetWords ?? fmt.targets.defaultWords,
        units: input.targetUnits ?? fmt.targets.defaultUnits,
      },
      contentDials: { heat: 0, violence: 0, tone: '' },
      currentStation: 0,
      stationStatus: initialStationStatus(),
      createdAt: ts,
      updatedAt: ts,
    };
    await db.projects.add(project);
    return project;
  },

  async update(id: string, patch: Partial<Project>): Promise<Project | undefined> {
    const existing = await db.projects.get(id);
    if (!existing) return undefined;
    const updated: Project = { ...existing, ...patch, id, updatedAt: now() };
    await db.projects.put(updated);
    return updated;
  },

  async rename(id: string, name: string): Promise<Project | undefined> {
    return projectRepo.update(id, { name: name.trim() || 'Untitled Book' });
  },

  /** Delete a project and everything that belongs to it (cascade). */
  async remove(id: string): Promise<void> {
    await db.transaction('rw', db.projects, db.bibleDocs, db.units, db.generations, async () => {
      const units = await db.units.where('projectId').equals(id).toArray();
      const unitIds = units.map((u) => u.id);
      if (unitIds.length) {
        await db.generations.where('unitId').anyOf(unitIds).delete();
      }
      await db.units.where('projectId').equals(id).delete();
      await db.bibleDocs.where('projectId').equals(id).delete();
      await db.projects.delete(id);
    });
  },

  /** % of the project's units that are approved (0 when no units yet). */
  async approvedProgress(id: string): Promise<number> {
    const units = await db.units.where('projectId').equals(id).toArray();
    if (units.length === 0) return 0;
    const approved = units.filter((u) => u.status === 'approved').length;
    return Math.round((approved / units.length) * 100);
  },
};

/** Full project bundle for JSON export/import (spec §4, §10 criterion 6). */
export interface ProjectExport {
  version: 1;
  exportedAt: number;
  project: Project;
  bibleDocs: BibleDoc[];
  units: Unit[];
  generations: Generation[];
}

export const backupRepo = {
  async exportProject(id: string): Promise<ProjectExport> {
    const project = await db.projects.get(id);
    if (!project) throw new Error(`Project ${id} not found`);
    const [bibleDocs, units] = await Promise.all([
      db.bibleDocs.where('projectId').equals(id).toArray(),
      db.units.where('projectId').equals(id).toArray(),
    ]);
    const unitIds = units.map((u) => u.id);
    const generations = unitIds.length
      ? await db.generations.where('unitId').anyOf(unitIds).toArray()
      : [];
    return { version: 1, exportedAt: now(), project, bibleDocs, units, generations };
  },

  /**
   * Import a previously exported project. Re-mints all ids so importing a
   * backup never clobbers an existing project (import creates a copy).
   * Returns the new project id.
   */
  async importProject(bundle: ProjectExport): Promise<string> {
    if (!bundle || bundle.version !== 1 || !bundle.project) {
      throw new Error('Invalid project file');
    }
    const idMap = new Map<string, string>();
    const remap = (oldId: string): string => {
      let mapped = idMap.get(oldId);
      if (!mapped) {
        mapped = newId();
        idMap.set(oldId, mapped);
      }
      return mapped;
    };

    const newProjectId = remap(bundle.project.id);
    const project: Project = { ...bundle.project, id: newProjectId, updatedAt: now() };
    const bibleDocs = bundle.bibleDocs.map((d) => ({
      ...d,
      id: remap(d.id),
      projectId: newProjectId,
    }));
    const units = bundle.units.map((u) => ({
      ...u,
      id: remap(u.id),
      projectId: newProjectId,
    }));
    const generations = bundle.generations.map((g) => ({
      ...g,
      id: remap(g.id),
      unitId: remap(g.unitId),
    }));

    await db.transaction('rw', db.projects, db.bibleDocs, db.units, db.generations, async () => {
      await db.projects.add(project);
      if (bibleDocs.length) await db.bibleDocs.bulkAdd(bibleDocs);
      if (units.length) await db.units.bulkAdd(units);
      if (generations.length) await db.generations.bulkAdd(generations);
    });
    return newProjectId;
  },
};
