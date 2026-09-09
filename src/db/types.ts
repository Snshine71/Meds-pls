/**
 * Core domain types (spec §4). Kept framework-free so both the Dexie layer
 * and the Zustand stores share one source of truth.
 */

export type ProjectFormat = 'novel' | 'picture-book';

export type StationId = 0 | 1 | 2 | 3 | 4 | 5;

export type StationStatus = 'locked' | 'active' | 'complete' | 'needs-review';

export type BibleDocType =
  | 'brief'
  | 'ending'
  | 'character'
  | 'structure'
  | 'style'
  | 'ledger';

export type UnitKind = 'chapter' | 'spread';

export type UnitStatus = 'empty' | 'drafting' | 'review' | 'approved';

export interface ContentDials {
  heat: 0 | 1 | 2 | 3;
  violence: 0 | 1 | 2 | 3;
  tone: string;
}

export interface Project {
  id: string;
  name: string;
  format: ProjectFormat;
  genre: string;
  audience: string;
  targets: { words: number; units: number };
  contentDials: ContentDials;
  currentStation: StationId;
  stationStatus: Record<number, StationStatus>;
  createdAt: number;
  updatedAt: number;
}

export interface BibleDoc {
  id: string;
  projectId: string;
  type: BibleDocType;
  title: string;
  content: string; // markdown
  meta?: Record<string, unknown>; // e.g. character visualBlock, beat mapping
  includeInPrompts: boolean; // default true; user can exclude
  updatedAt: number;
}

export interface Unit {
  id: string;
  projectId: string;
  order: number;
  kind: UnitKind;
  title: string;
  beatRef: string; // which StructureMap beat(s) this covers
  draft: string; // approved text (markdown)
  illustrationBrief?: string; // picture-book only
  imagePrompt?: string; // picture-book only
  summary?: string; // auto-generated on approval → ledger
  status: UnitStatus;
  wordCount: number;
  updatedAt: number;
}

export interface Generation {
  id: string;
  unitId: string;
  createdAt: number;
  kind: string; // draft | revise | regenerate | expand | punch-up | etc.
  content: string;
  model: string;
  tokensIn?: number;
  tokensOut?: number;
}

/** settings table is a simple key/value store (spec §4). */
export interface SettingRecord {
  key: string;
  value: unknown;
}
