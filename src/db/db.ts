import Dexie, { type Table } from 'dexie';
import type {
  Project,
  BibleDoc,
  Unit,
  Generation,
  SettingRecord,
} from './types';

/**
 * Dexie v1 schema (spec §4). All story data lives here in the browser —
 * local-first, no backend. Full-project JSON export/import is layered on top
 * in the repositories module.
 */
export class SandTableDB extends Dexie {
  projects!: Table<Project, string>;
  bibleDocs!: Table<BibleDoc, string>;
  units!: Table<Unit, string>;
  generations!: Table<Generation, string>;
  settings!: Table<SettingRecord, string>;

  constructor() {
    super('sand-table');
    this.version(1).stores({
      projects: 'id, name, format, updatedAt',
      bibleDocs: 'id, projectId, type, updatedAt',
      units: 'id, projectId, [projectId+order], status',
      generations: 'id, unitId, createdAt',
      settings: 'key',
    });
  }
}

export const db = new SandTableDB();
