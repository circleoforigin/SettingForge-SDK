import type {
  ContractFieldDefinition,
} from './CommandDefinition';

export interface QueryDefinition {
  id: string;
  label: string;
  description?: string;
  input?: ContractFieldDefinition[];
  output?: ContractFieldDefinition[];
}

export interface RegisteredQueryDefinition
  extends QueryDefinition {
  moduleId: string;
  moduleName: string;
}