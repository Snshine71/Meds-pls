import { useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useProjectStore } from '@/stores/projectStore';
import { testConnection } from '@/lib/anthropic';
import {
  AVAILABLE_MODELS,
  DEFAULT_MODELS,
  TASK_LABELS,
  type TaskKind,
} from '@/config/models';
import { db } from '@/db/db';
import { Button } from '@/components/ui/Button';
import { toast } from '@/stores/toastStore';

/** Settings screen — spec §7.4. */
export function Settings() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold uppercase tracking-wide text-ink">
          Settings
        </h1>
        <p className="text-sm text-ink/60">Your key and preferences live only on this device.</p>
      </div>
      <ApiKeySection />
      <ModelSection />
      <AppearanceSection />
      <DeveloperSection />
      <DangerZone />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded border border-blueprint-2/30 bg-panel p-5">
      <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-ink">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function ApiKeySection() {
  const { apiKey, setApiKey, modelFor } = useSettingsStore();
  const [draft, setDraft] = useState(apiKey);
  const [testing, setTesting] = useState(false);

  async function onSave() {
    await setApiKey(draft.trim());
    toast.success('API key saved.');
  }

  async function onTest() {
    await setApiKey(draft.trim());
    setTesting(true);
    try {
      const result = await testConnection(draft.trim(), modelFor('brainstorm'));
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
    } finally {
      setTesting(false);
    }
  }

  return (
    <Section title="Anthropic API Key">
      <label className="block text-sm font-medium text-ink" htmlFor="api-key">
        Key
      </label>
      <input
        id="api-key"
        type="password"
        autoComplete="off"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="sk-ant-…"
        className="mt-1 w-full rounded border border-blueprint-2/50 bg-surface px-3 py-2 font-mono text-sm outline-none focus:border-blueprint"
      />
      <p className="mt-2 text-xs text-ink/50">
        Stored only on this device (in your browser). It is sent directly to the Anthropic API and
        nowhere else.
      </p>
      <div className="mt-3 flex gap-2">
        <Button onClick={onSave} disabled={testing}>
          Save
        </Button>
        <Button variant="secondary" onClick={onTest} disabled={testing || !draft.trim()}>
          {testing ? 'Testing…' : 'Test connection'}
        </Button>
      </div>
    </Section>
  );
}

function ModelSection() {
  const { modelOverrides, setModelOverride } = useSettingsStore();
  const tasks = Object.keys(TASK_LABELS) as TaskKind[];
  return (
    <Section title="Model Routing">
      <p className="text-xs text-ink/50">
        Each task uses a sensible default. Override any of them here — model names are centralized,
        so the app stays current.
      </p>
      <div className="mt-3 space-y-3">
        {tasks.map((task) => {
          const current = modelOverrides[task] ?? '';
          return (
            <label key={task} className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-ink">{TASK_LABELS[task]}</span>
              <select
                value={current}
                onChange={(e) => setModelOverride(task, e.target.value || null)}
                className="rounded border border-blueprint-2/50 bg-surface px-3 py-2 text-sm outline-none focus:border-blueprint"
              >
                <option value="">Default — {DEFAULT_MODELS[task]}</option>
                {AVAILABLE_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
          );
        })}
      </div>
    </Section>
  );
}

function AppearanceSection() {
  const { theme, setTheme } = useSettingsStore();
  return (
    <Section title="Appearance">
      <div className="flex items-center gap-2">
        <span className="text-sm text-ink">Theme</span>
        <div className="inline-flex overflow-hidden rounded border border-blueprint-2/50">
          {(['light', 'dark'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-4 py-1.5 text-sm capitalize ${
                theme === t ? 'bg-blueprint text-white' : 'bg-surface text-ink'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </Section>
  );
}

function DeveloperSection() {
  const { showPromptDebug, setShowPromptDebug } = useSettingsStore();
  return (
    <Section title="Developer Mode">
      <label className="flex items-center gap-3 text-sm text-ink">
        <input
          type="checkbox"
          checked={showPromptDebug}
          onChange={(e) => setShowPromptDebug(e.target.checked)}
        />
        <span>
          Show the assembled prompt before each AI call (&quot;view prompt&quot; toggle). Useful for
          verifying the Story Bible is being injected.
        </span>
      </label>
    </Section>
  );
}

function DangerZone() {
  const { loadAll } = useProjectStore();
  const [confirmText, setConfirmText] = useState('');

  async function onWipe() {
    await db.transaction(
      'rw',
      db.projects,
      db.bibleDocs,
      db.units,
      db.generations,
      async () => {
        await Promise.all([
          db.projects.clear(),
          db.bibleDocs.clear(),
          db.units.clear(),
          db.generations.clear(),
        ]);
      },
    );
    await loadAll();
    setConfirmText('');
    toast.info('All local story data wiped.');
  }

  return (
    <section className="rounded border border-signal/40 bg-signal-soft/60 p-5">
      <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-signal">
        Danger Zone
      </h2>
      <p className="mt-2 text-sm text-ink/70">
        Permanently delete every project and all story data on this device. Your API key and
        preferences are kept. Export a backup first if you might want it back.
      </p>
      <label className="mt-3 block text-sm text-ink">
        Type <code className="rounded bg-panel px-1">DELETE</code> to confirm
        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="mt-1 w-full rounded border border-signal/50 bg-surface px-3 py-2 text-sm outline-none focus:border-signal"
        />
      </label>
      <div className="mt-3">
        <Button variant="danger" disabled={confirmText !== 'DELETE'} onClick={onWipe}>
          Wipe all local data
        </Button>
      </div>
    </section>
  );
}
