import type { ProjectFormat, StationId } from '@/db/types';

/**
 * Format definition system (spec §5). Formats are DATA, not code branches.
 * This registry drives targets, unit vocabulary, and per-station copy so
 * adding a future format = adding an object here, not new architecture.
 *
 * Phase 1 wires the registry and its defaults; structure templates and
 * per-station prompt overrides are filled in during later phases.
 */

export interface StructureTemplate {
  id: string;
  label: string;
}

export interface AgeBand {
  id: string;
  label: string; // "4–8"
  pages: string;
  totalWords: string;
  perSpreadGuide: number;
  voiceGuidance: string;
  defaultWords: number;
  defaultUnits: number;
}

export interface StationVariantConfig {
  title?: string;
  blurb?: string;
}

export interface FormatDef {
  id: ProjectFormat;
  label: string;
  unitKind: 'chapter' | 'spread';
  unitLabel: string;
  unitLabelPlural: string;
  genres: string[];
  structures: StructureTemplate[];
  targets: { defaultWords: number; defaultUnits: number; wordsPerUnitWarn?: number };
  ageBands?: AgeBand[];
  stationVariants: Partial<Record<StationId, StationVariantConfig>>;
  draftOutputs: ('text' | 'illustrationBrief' | 'imagePrompt')[];
  compileStrategy: 'chunked' | 'single';
}

export const PICTURE_BOOK_AGE_BANDS: AgeBand[] = [
  {
    id: '2-5',
    label: '2–5',
    pages: '24–32',
    totalWords: '200–400',
    perSpreadGuide: 30,
    voiceGuidance: 'Rhythm/repetition, sing-song welcome',
    defaultWords: 300,
    defaultUnits: 16,
  },
  {
    id: '4-8',
    label: '4–8',
    pages: '32',
    totalWords: '500–800',
    perSpreadGuide: 60,
    voiceGuidance: 'Read-aloud, one problem, child solves it',
    defaultWords: 640,
    defaultUnits: 16,
  },
  {
    id: '6-10',
    label: '6–10',
    pages: '32–48',
    totalWords: '800–1,500',
    perSpreadGuide: 90,
    voiceGuidance: 'Richer vocab, light subplot allowed',
    defaultWords: 1100,
    defaultUnits: 16,
  },
];

export const FORMATS: Record<ProjectFormat, FormatDef> = {
  novel: {
    id: 'novel',
    label: 'Novel',
    unitKind: 'chapter',
    unitLabel: 'Chapter',
    unitLabelPlural: 'Chapters',
    genres: [
      'Fantasy',
      'Science Fiction',
      'Mystery',
      'Thriller',
      'Romance',
      'Literary Fiction',
      'Horror',
      'Historical Fiction',
      'Young Adult',
    ],
    structures: [
      { id: 'save-the-cat', label: 'Save the Cat (15 beats)' },
      { id: 'heros-journey', label: "Hero's Journey (12 stages)" },
      { id: 'mystery-12', label: '12-Step Mystery Formula' },
      { id: 'romance-beats', label: 'Romance Beat Sheet' },
      { id: 'three-act', label: 'Three-Act (simple)' },
    ],
    targets: { defaultWords: 60000, defaultUnits: 24 },
    stationVariants: {
      1: { title: 'The Objective', blurb: 'Lock the ending first.' },
    },
    draftOutputs: ['text'],
    compileStrategy: 'chunked',
  },
  'picture-book': {
    id: 'picture-book',
    label: "Children's Picture Book",
    unitKind: 'spread',
    unitLabel: 'Spread',
    unitLabelPlural: 'Spreads',
    genres: [
      'Bedtime',
      'Adventure',
      'Friendship',
      'Feelings & Emotions',
      'Animals',
      'Counting / ABC',
      'Humor',
    ],
    structures: [
      { id: 'story-spine', label: 'Story Spine' },
      { id: 'problem-tries-solution', label: 'Problem / 3-Tries / Solution' },
    ],
    targets: { defaultWords: 640, defaultUnits: 16, wordsPerUnitWarn: 60 },
    ageBands: PICTURE_BOOK_AGE_BANDS,
    stationVariants: {
      1: {
        title: 'The Objective',
        blurb: 'Lock the emotional resolution and final-spread image.',
      },
    },
    draftOutputs: ['text', 'illustrationBrief', 'imagePrompt'],
    compileStrategy: 'single',
  },
};

export function getFormatDef(format: ProjectFormat): FormatDef {
  return FORMATS[format];
}

export const FORMAT_LIST: FormatDef[] = Object.values(FORMATS);
