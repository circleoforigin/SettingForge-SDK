export type ActionFieldType =
  | 'string'
  | 'number'
  | 'boolean';

export interface ActionFieldDefinition {
  key: string;
  label: string;
  type: ActionFieldType;
}

export interface ActionDefinition {
  id: string;
  label: string;
  description?: string;
  fields?: ActionFieldDefinition[];
}

export interface RegisteredActionDefinition extends ActionDefinition {
  moduleId: string;
  moduleName: string;
}
