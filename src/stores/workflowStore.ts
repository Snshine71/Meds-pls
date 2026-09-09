import { create } from 'zustand';
import type { Project, StationId } from '@/db/types';
import { projectRepo } from '@/db/repositories';

/**
 * Workflow store (spec §3 "The Mission Plan"). Owns the currently open
 * project and station navigation. Station-unlocking logic is fleshed out in
 * Phase 2; Phase 1 loads a project into the shell and tracks the active
 * station.
 */

interface WorkflowState {
  project: Project | null;
  loading: boolean;
  activeStation: StationId;

  open: (projectId: string) => Promise<void>;
  close: () => void;
  goToStation: (station: StationId) => void;
  /** A station is reachable if it is not locked. */
  isUnlocked: (station: StationId) => boolean;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  project: null,
  loading: false,
  activeStation: 0,

  open: async (projectId) => {
    set({ loading: true });
    const project = await projectRepo.get(projectId);
    set({
      project: project ?? null,
      activeStation: project?.currentStation ?? 0,
      loading: false,
    });
  },

  close: () => set({ project: null, activeStation: 0 }),

  goToStation: (station) => {
    if (get().isUnlocked(station)) set({ activeStation: station });
  },

  isUnlocked: (station) => {
    const project = get().project;
    if (!project) return station === 0;
    return project.stationStatus[station] !== 'locked';
  },
}));
