export type OccurrenceType =
  | 'encounter'
  | 'weather'
  | 'almanac'
  | 'section'
  | 'location'
  | 'player';

export const OccurrenceReactions = {
  None: 'none',
  Notify: 'notify',
  Recalculate: 'recalculate',
  Interrupt: 'interrupt',
  End: 'end',
} as const;

export type OccurrenceReaction =
  typeof OccurrenceReactions[
    keyof typeof OccurrenceReactions
  ];

export interface Occurrence
{
  id: string;
  prospectId: string;
  sourceModuleId: string;

  simulationTime: number;

  pieceId: string | null;
  entityId: string | null;
  sectorId: string | null;

  type?: OccurrenceType;

  title?: string;
  description?: string;

  reaction: OccurrenceReaction;

  payload?: unknown;
}