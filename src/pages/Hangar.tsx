import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/stores/projectStore';
import { projectRepo, type ProjectExport } from '@/db/repositories';
import { getFormatDef } from '@/config/formats';
import { getStation } from '@/config/stations';
import type { Project, ProjectFormat } from '@/db/types';
import { Button } from '@/components/ui/Button';
import { ProgressRing } from '@/components/ProgressRing';
import { toast } from '@/stores/toastStore';

/**
 * Hangar (home) — spec §7.1. Project cards + big "New Book" button + import.
 * The one primary action is impossible to miss (spec §7 simplicity mandate).
 */
export function Hangar() {
  const { projects, loaded, loadAll, importProject } = useProjectStore();
  const [showNew, setShowNew] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  async function onImportFile(file: File) {
    try {
      const text = await file.text();
      const bundle = JSON.parse(text) as ProjectExport;
      const id = await importProject(bundle);
      toast.success('Project imported.');
      return id;
    } catch (err) {
      toast.error(
        `Import failed: ${err instanceof Error ? err.message : 'invalid file'}`,
      );
      return undefined;
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold uppercase tracking-wide text-ink">
            Hangar
          </h1>
          <p className="text-sm text-ink/60">Your books. Pick one up, or plan a new mission.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) await onImportFile(file);
            }}
          />
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            Import JSON
          </Button>
          <Button onClick={() => setShowNew(true)}>+ New Book</Button>
        </div>
      </div>

      {!loaded ? (
        <p className="text-ink/50">Loading…</p>
      ) : projects.length === 0 ? (
        <EmptyState onNew={() => setShowNew(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      {showNew && <NewProjectDialog onClose={() => setShowNew(false)} />}
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="rounded border border-dashed border-blueprint-2/50 bg-panel/60 p-12 text-center">
      <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-ink">
        No books yet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
        A sand table is where you plan the mission before you execute it. Start your first book —
        the app walks you through every station.
      </p>
      <div className="mt-6">
        <Button onClick={onNew}>+ New Book</Button>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const navigate = useNavigate();
  const { rename, remove } = useProjectStore();
  const [progress, setProgress] = useState(0);
  const fmt = getFormatDef(project.format);

  useEffect(() => {
    void projectRepo.approvedProgress(project.id).then(setProgress);
  }, [project.id, project.updatedAt]);

  async function onRename() {
    const name = window.prompt('Rename book', project.name);
    if (name && name.trim()) await rename(project.id, name);
  }

  async function onDelete() {
    if (
      window.confirm(
        `Delete "${project.name}"? This removes all its story data and cannot be undone.`,
      )
    ) {
      await remove(project.id);
      toast.info('Project deleted.');
    }
  }

  return (
    <div className="flex flex-col rounded border border-blueprint-2/30 bg-panel p-4 shadow-sm transition-shadow hover:shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-block rounded bg-blueprint/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blueprint">
            {fmt.label}
          </span>
          <h3
            className="mt-2 truncate font-display text-lg font-semibold text-ink"
            title={project.name}
          >
            {project.name}
          </h3>
        </div>
        <ProgressRing percent={progress} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-ink/60">
        <div>
          <dt className="uppercase tracking-wide text-ink/40">Station</dt>
          <dd className="text-ink">{getStation(project.currentStation).title}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wide text-ink/40">Target</dt>
          <dd className="text-ink">
            {project.targets.words.toLocaleString()} words / {project.targets.units}{' '}
            {fmt.unitLabelPlural.toLowerCase()}
          </dd>
        </div>
      </dl>

      <p className="mt-2 text-[11px] text-ink/40">
        Last touched {new Date(project.updatedAt).toLocaleDateString()}
      </p>

      <div className="mt-4 flex items-center gap-2">
        <Button className="flex-1" onClick={() => navigate(`/project/${project.id}`)}>
          Open
        </Button>
        <Button variant="ghost" onClick={onRename} aria-label={`Rename ${project.name}`}>
          Rename
        </Button>
        <Button variant="ghost" onClick={onDelete} aria-label={`Delete ${project.name}`}>
          <span className="text-signal">Delete</span>
        </Button>
      </div>
    </div>
  );
}

const FORMAT_OPTIONS: { id: ProjectFormat; label: string; hint: string }[] = [
  { id: 'novel', label: 'Novel', hint: '50–90k words, genre fiction, chapters' },
  {
    id: 'picture-book',
    label: "Children's Picture Book",
    hint: '32-page standard, 16 spreads with illustration briefs',
  },
];

function NewProjectDialog({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const create = useProjectStore((s) => s.create);
  const [name, setName] = useState('');
  const [format, setFormat] = useState<ProjectFormat>('novel');
  const [busy, setBusy] = useState(false);

  const fmt = useMemo(() => getFormatDef(format), [format]);

  async function onCreate() {
    setBusy(true);
    try {
      const project = await create({ name, format });
      toast.success('Book created. Start with the Briefing.');
      navigate(`/project/${project.id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="New book"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div className="w-full max-w-md rounded border border-blueprint-2/30 bg-panel p-6 shadow-lg">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-ink">
          New Book
        </h2>
        <p className="mt-1 text-sm text-ink/60">Name it and pick a format. You can refine everything in the Briefing.</p>

        <label className="mt-4 block text-sm font-medium text-ink">
          Book name
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Untitled Book"
            className="mt-1 w-full rounded border border-blueprint-2/50 bg-surface px-3 py-2 text-sm outline-none focus:border-blueprint"
          />
        </label>

        <fieldset className="mt-4">
          <legend className="text-sm font-medium text-ink">Format</legend>
          <div className="mt-2 space-y-2">
            {FORMAT_OPTIONS.map((opt) => (
              <label
                key={opt.id}
                className={`flex cursor-pointer items-start gap-3 rounded border p-3 ${
                  format === opt.id
                    ? 'border-blueprint bg-blueprint/5'
                    : 'border-blueprint-2/40'
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  className="mt-1"
                  checked={format === opt.id}
                  onChange={() => setFormat(opt.id)}
                />
                <span>
                  <span className="block text-sm font-semibold text-ink">{opt.label}</span>
                  <span className="block text-xs text-ink/60">{opt.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <p className="mt-3 text-xs text-ink/50">
          Defaults: {fmt.targets.defaultWords.toLocaleString()} words across{' '}
          {fmt.targets.defaultUnits} {fmt.unitLabelPlural.toLowerCase()}.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={onCreate} disabled={busy}>
            {busy ? 'Creating…' : 'Create Book'}
          </Button>
        </div>
      </div>
    </div>
  );
}
