import { create } from 'zustand';
import { db } from '@/db/db';
import { DEFAULT_MODELS, type TaskKind } from '@/config/models';

/**
 * Settings store (spec §4 settings table, §7 Settings screen).
 * Holds the BYOK API key, model overrides, theme, and developer flags.
 * Everything persists to the Dexie `settings` key/value table.
 */

export type Theme = 'light' | 'dark';

interface SettingsState {
  loaded: boolean;
  apiKey: string;
  modelOverrides: Partial<Record<TaskKind, string>>;
  theme: Theme;
  showPromptDebug: boolean; // developer mode "view prompt" toggle (§10.2)

  load: () => Promise<void>;
  setApiKey: (key: string) => Promise<void>;
  setModelOverride: (task: TaskKind, model: string | null) => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
  setShowPromptDebug: (on: boolean) => Promise<void>;
  /** Effective model for a task after applying overrides. */
  modelFor: (task: TaskKind) => string;
}

const KEYS = {
  apiKey: 'apiKey',
  modelOverrides: 'modelOverrides',
  theme: 'theme',
  showPromptDebug: 'showPromptDebug',
} as const;

async function readSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await db.settings.get(key);
  return row ? (row.value as T) : fallback;
}

async function writeSetting(key: string, value: unknown): Promise<void> {
  await db.settings.put({ key, value });
}

function applyTheme(theme: Theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  loaded: false,
  apiKey: '',
  modelOverrides: {},
  theme: 'light',
  showPromptDebug: false,

  load: async () => {
    const [apiKey, modelOverrides, theme, showPromptDebug] = await Promise.all([
      readSetting<string>(KEYS.apiKey, ''),
      readSetting<Partial<Record<TaskKind, string>>>(KEYS.modelOverrides, {}),
      readSetting<Theme>(KEYS.theme, 'light'),
      readSetting<boolean>(KEYS.showPromptDebug, false),
    ]);
    applyTheme(theme);
    set({ apiKey, modelOverrides, theme, showPromptDebug, loaded: true });
  },

  setApiKey: async (key: string) => {
    await writeSetting(KEYS.apiKey, key);
    set({ apiKey: key });
  },

  setModelOverride: async (task: TaskKind, model: string | null) => {
    const next = { ...get().modelOverrides };
    if (model) next[task] = model;
    else delete next[task];
    await writeSetting(KEYS.modelOverrides, next);
    set({ modelOverrides: next });
  },

  setTheme: async (theme: Theme) => {
    applyTheme(theme);
    await writeSetting(KEYS.theme, theme);
    set({ theme });
  },

  setShowPromptDebug: async (on: boolean) => {
    await writeSetting(KEYS.showPromptDebug, on);
    set({ showPromptDebug: on });
  },

  modelFor: (task: TaskKind) => {
    return get().modelOverrides[task] ?? DEFAULT_MODELS[task];
  },
}));
