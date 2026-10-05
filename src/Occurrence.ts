export interface Occurrence
{
  id: string;
  prospectId: string;
  sourceModuleId: string;

  simulationTime: number;

  pieceId: string | null;
  entityId: string | null;
  sectorId: string | null;

  title: string;
  description?: string;

  tags: string[];

  payload?: unknown;
}