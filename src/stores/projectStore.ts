import { create } from 'zustand';
import type { Project } from '@/db/types';
import {
  projectRepo,
  backupRepo,
  type CreateProjectInput,
  type ProjectExport,
} from '@/db/repositories';

/**
 * Project store (spec §7 Hangar). Owns the project list + the currently open
 * project, and proxies CRUD through the repository layer so the UI stays thin.
 */

interface ProjectState {
  projects: Project[];
  loaded: boolean;

  loadAll: () => Promise<void>;
  create: (input: CreateProjectInput) => Promise<Project>;
  rename: (id: string, name: string) => Promise<void>;
  update: (id: string, patch: Partial<Project>) => Promise<void>;
  remove: (id: string) => Promise<void>;

  exportProject: (id: string) => Promise<ProjectExport>;
  importProject: (bundle: ProjectExport) => Promise<string>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loaded: false,

  loadAll: async () => {
    const projects = await projectRepo.list();
    set({ projects, loaded: true });
  },

  create: async (input) => {
    const project = await projectRepo.create(input);
    await get().loadAll();
    return project;
  },

  rename: async (id, name) => {
    await projectRepo.rename(id, name);
    await get().loadAll();
  },

  update: async (id, patch) => {
    await projectRepo.update(id, patch);
    await get().loadAll();
  },

  remove: async (id) => {
    await projectRepo.remove(id);
    await get().loadAll();
  },

  exportProject: async (id) => backupRepo.exportProject(id),

  importProject: async (bundle) => {
    const id = await backupRepo.importProject(bundle);
    await get().loadAll();
    return id;
  },
}));
