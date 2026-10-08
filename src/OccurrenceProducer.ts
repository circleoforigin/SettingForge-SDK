import type { Occurrence } from './Occurrence';

export interface OccurrenceSubmission
{
  prospectId: string;
  occurrences: Occurrence[];
}