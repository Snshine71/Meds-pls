/**
 * Central model + pricing config (spec §2, §6).
 * Model names change; the app should update in ONE place. Everything that
 * needs a model ID or a price imports from here.
 */

export type TaskKind = 'brainstorm' | 'draft' | 'audit' | 'compile';

/** Default model routing per spec §2. User-overridable in Settings. */
export const DEFAULT_MODELS: Record<TaskKind, string> = {
  brainstorm: 'claude-sonnet-4-6',
  draft: 'claude-sonnet-4-6',
  audit: 'claude-opus-4-8',
  compile: 'claude-opus-4-8',
};

/** Human labels for the Settings model-override UI. */
export const TASK_LABELS: Record<TaskKind, string> = {
  brainstorm: 'Brainstorming (endings, characters, titles)',
  draft: 'Chapter / spread drafting',
  audit: 'Continuity audit',
  compile: 'Full-manuscript compile & polish',
};

/** Models offered in override dropdowns. */
export const AVAILABLE_MODELS: { id: string; label: string }[] = [
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (fast, creative volume)' },
  { id: 'claude-opus-4-8', label: 'Claude Opus 4.8 (deep editorial pass)' },
];

/**
 * Published pricing, USD per 1M tokens. Used for the session cost estimate
 * in the drafting header (spec §6). Update alongside model IDs.
 */
export interface ModelPricing {
  inputPerMTok: number;
  outputPerMTok: number;
}

export const PRICING: Record<string, ModelPricing> = {
  'claude-sonnet-4-6': { inputPerMTok: 3, outputPerMTok: 15 },
  'claude-opus-4-8': { inputPerMTok: 15, outputPerMTok: 75 },
};

/** Anthropic Messages API endpoint + version (spec §2). */
export const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
export const ANTHROPIC_VERSION = '2023-06-01';
