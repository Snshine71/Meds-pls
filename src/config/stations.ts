import type { StationId } from '@/db/types';

/** The six guided stations (spec §3) — "The Mission Plan". */
export interface StationDef {
  id: StationId;
  code: string; // short waypoint label
  title: string;
  blurb: string;
}

export const STATIONS: StationDef[] = [
  { id: 0, code: 'S0', title: 'Briefing', blurb: 'Project setup' },
  { id: 1, code: 'S1', title: 'The Objective', blurb: 'Ending first' },
  { id: 2, code: 'S2', title: 'The Roster', blurb: 'Characters' },
  { id: 3, code: 'S3', title: 'Scheme of Maneuver', blurb: 'Structure' },
  { id: 4, code: 'S4', title: 'Execution', blurb: 'Drafting' },
  { id: 5, code: 'S5', title: 'Consolidation', blurb: 'Compile & export' },
];

export function getStation(id: StationId): StationDef {
  return STATIONS[id];
}
