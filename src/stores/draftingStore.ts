import { create } from 'zustand';

/**
 * Drafting store (spec §3 Station 4). The drafting surface — unit list,
 * streaming generation, review/approve loop, continuity ledger, and the
 * session cost estimate — is built in Phase 3. This scaffold establishes the
 * domain store and the running cost accumulator so the header can bind to it
 * from the start.
 */

interface DraftingState {
  sessionCostUsd: number;
  addCost: (usd: number) => void;
  resetCost: () => void;
}

export const useDraftingStore = create<DraftingState>((set) => ({
  sessionCostUsd: 0,
  addCost: (usd) => set((s) => ({ sessionCostUsd: s.sessionCostUsd + usd })),
  resetCost: () => set({ sessionCostUsd: 0 }),
}));
