import type { Occurrence } from './Occurrence';

export interface OccurrenceSubmission
{
  pieceId: string;
  occurrences: Occurrence[];
}