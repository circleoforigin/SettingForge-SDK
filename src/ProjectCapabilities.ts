import type {
  CommandDefinition,
} from './CommandDefinition';

import type {
  EventDefinition,
} from './EventDefinition';

import type {
  QueryDefinition,
} from './QueryDefinition';

export const projectEventDefinitions:
  EventDefinition[] = [
    {
      id: 'project.loaded',
      label: 'Project Loaded',
      description:
        'A module finished loading a Project.',
    },
    {
      id: 'project.loadFailed',
      label: 'Project Load Failed',
      description:
        'A module failed to load a Project.',
    },
  ];

export const projectCommandDefinitions:
  CommandDefinition[] = [
    {
      id: 'project.create',
      label: 'Create Project',
    },
    {
      id: 'project.rename',
      label: 'Rename Project',
    },
    {
      id: 'project.delete',
      label: 'Delete Project',
    },
    {
      id: 'project.load',
      label: 'Load Project',
    },
    {
      id: 'project.save',
      label: 'Save Project',
    },
    {
      id: 'project.close',
      label: 'Close Project',
    },
  ];

export const projectQueryDefinitions:
  QueryDefinition[] = [
    {
      id: 'project.list',
      label: 'List Projects',
    },
    {
      id: 'project.status',
      label: 'Get Project Status',
    },
  ];