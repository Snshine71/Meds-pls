import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useProjectStore } from '@/stores/projectStore';
import { StationStepper } from '@/components/StationStepper';
import { getStation } from '@/config/stations';
import { getFormatDef } from '@/config/formats';
import { Button } from '@/components/ui/Button';
import { toast } from '@/stores/toastStore';

/**
 * Mission Plan (project shell) — spec §7.2. One route with station panels (not
 * six routes) so back/forward within a project is instant. Phase 1 renders the
 * shell, the persistent stepper, and per-station placeholders; the station
 * content forms are built in Phases 2–5.
 */
export function MissionPlan() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { project, loading, activeStation, open, goToStation } = useWorkflowStore();
  const exportProject = useProjectStore((s) => s.exportProject);

  useEffect(() => {
    if (projectId) void open(projectId);
  }, [projectId, open]);

  if (loading) {
    return <p className="text-ink/50">Loading project…</p>;
  }

  if (!project) {
    return (
      <div className="rounded border border-signal/40 bg-signal-soft/60 p-8 text-center">
        <h1 className="font-display text-xl font-semibold uppercase text-signal">
          Project not found
        </h1>
        <p className="mt-2 text-sm text-ink/70">
          It may have been deleted on this device.
        </p>
        <div className="mt-4">
          <Link to="/">
            <Button>Back to Hangar</Button>
          </Link>
        </div>
      </div>
    );
  }

  const fmt = getFormatDef(project.format);
  const station = getStation(activeStation);

  async function onExport() {
    try {
      const bundle = await exportProject(project!.id);
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project!.name.replace(/[^\w-]+/g, '_')}.sandtable.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Project backup exported.');
    } catch {
      toast.error('Export failed.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            onClick={() => navigate('/')}
            className="text-xs uppercase tracking-wide text-ink/50 hover:text-blueprint"
          >
            ← Hangar
          </button>
          <h1 className="font-display text-2xl font-semibold text-ink">{project.name}</h1>
          <p className="text-xs uppercase tracking-wide text-ink/50">
            {fmt.label} · {project.targets.words.toLocaleString()} words ·{' '}
            {project.targets.units} {fmt.unitLabelPlural.toLowerCase()}
          </p>
        </div>
        <Button variant="secondary" onClick={onExport}>
          Export JSON backup
        </Button>
      </div>

      <div className="rounded border border-blueprint-2/30 bg-panel p-5">
        <StationStepper
          project={project}
          activeStation={activeStation}
          onSelect={(s) => goToStation(s)}
        />
      </div>

      <div className="rounded border border-blueprint-2/30 bg-panel p-6">
        <div className="mb-2 flex items-baseline gap-3">
          <span className="rounded bg-blueprint px-2 py-0.5 font-display text-xs font-semibold uppercase tracking-wider text-white">
            Station {station.id}
          </span>
          <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-ink">
            {station.title}
          </h2>
        </div>
        <p className="text-sm text-ink/60">{station.blurb}</p>

        <div className="mt-6 rounded border border-dashed border-blueprint-2/50 bg-surface/60 p-8 text-center text-sm text-ink/50">
          This station&apos;s guided workflow arrives in a later build phase. The project shell,
          persistent mission-timeline stepper, and station navigation are in place.
        </div>
      </div>
    </div>
  );
}
