export type EventFieldType =
  | 'string'
  | 'number'
  | 'boolean';

export type EventDelivery =
  | 'transient'
  | 'state';

export interface EventFieldDefinition {
  key: string;
  label: string;
  type: EventFieldType;
}

export interface EventDefinition {
  id: string;
  label: string;
  description?: string;
  fields?: EventFieldDefinition[];
  delivery?: EventDelivery;
}

export interface RegisteredEventDefinition
  extends EventDefinition {
  moduleId: string;
  moduleName: string;
}