import type { Project, StationId, StationStatus } from '@/db/types';
import { STATIONS } from '@/config/stations';

/**
 * The signature element (spec §8): the station stepper styled as a mission
 * timeline — a rail with SQUARE waypoint nodes (not circles), a progress line
 * that fills blueprint-blue, and nodes that flip to go-green on completion.
 * Horizontal on desktop, vertical on mobile.
 */

interface StationStepperProps {
  project: Project;
  activeStation: StationId;
  onSelect: (station: StationId) => void;
}

function nodeClasses(status: StationStatus, isActive: boolean): string {
  if (status === 'complete') return 'bg-go border-go text-white';
  if (status === 'needs-review') return 'bg-signal-soft border-signal text-signal';
  if (isActive || status === 'active') return 'bg-blueprint border-blueprint text-white';
  return 'bg-panel border-blueprint-2/50 text-ink/50'; // locked
}

export function StationStepper({ project, activeStation, onSelect }: StationStepperProps) {
  const completed = STATIONS.filter(
    (s) => project.stationStatus[s.id] === 'complete',
  ).length;
  const progressPct = (completed / (STATIONS.length - 1)) * 100;

  return (
    <nav aria-label="Mission plan stations" className="w-full">
      <ol className="relative flex flex-col gap-4 md:flex-row md:items-start md:gap-0">
        {/* progress rail (desktop) */}
        <div
          className="pointer-events-none absolute left-0 right-0 top-4 hidden h-0.5 bg-blueprint-2/40 md:block"
          aria-hidden="true"
        >
          <div
            className="h-full bg-blueprint transition-[width]"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {STATIONS.map((station) => {
          const status = project.stationStatus[station.id] ?? 'locked';
          const isActive = station.id === activeStation;
          const locked = status === 'locked';
          return (
            <li key={station.id} className="relative z-10 flex-1 md:text-center">
              <button
                type="button"
                onClick={() => onSelect(station.id)}
                disabled={locked}
                aria-current={isActive ? 'step' : undefined}
                className="group flex w-full items-center gap-3 text-left md:flex-col md:items-center md:gap-2 md:text-center"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center border-2 text-xs font-semibold ${nodeClasses(
                    status,
                    isActive,
                  )} ${locked ? '' : 'group-hover:ring-2 group-hover:ring-blueprint/30'}`}
                  style={{ borderRadius: 4 }}
                >
                  {status === 'complete' ? '✓' : station.id}
                </span>
                <span className="flex flex-col md:items-center">
                  <span
                    className={`font-display text-sm font-semibold uppercase tracking-wide ${
                      locked ? 'text-ink/40' : 'text-ink'
                    }`}
                  >
                    {station.title}
                  </span>
                  <span className="text-xs text-ink/50">{station.blurb}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
