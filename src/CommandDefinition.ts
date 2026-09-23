export type ContractValueType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array';

export interface ContractFieldDefinition {
  key: string;
  label: string;
  type: ContractValueType;
  required?: boolean;
  description?: string;
}

export interface CommandDefinition {
  id: string;
  label: string;
  description?: string;
  input?: ContractFieldDefinition[];
  output?: ContractFieldDefinition[];
}

export interface RegisteredCommandDefinition
  extends CommandDefinition {
  moduleId: string;
  moduleName: string;
}