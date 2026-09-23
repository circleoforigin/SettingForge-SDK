import type {
  EventDefinition,
} from './EventDefinition';

import type {
  CommandDefinition,
} from './CommandDefinition';

import type {
  QueryDefinition,
} from './QueryDefinition';

export interface ModuleCapabilitySet {
  events: EventDefinition[];
  commands: CommandDefinition[];
  queries: QueryDefinition[];
}

export interface ModulePresence {
  id: string;
  name: string;
  version: string;
  state:
    | 'enabled'
    | 'starting'
    | 'ready'
    | 'stopped';
  capabilities: ModuleCapabilitySet;
}