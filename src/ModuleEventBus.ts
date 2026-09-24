import type {
  HostEventMessage,
  HostMessage,
  HostRequestMessage,
  HostResponseMessage,
} from './HostMessage';

import type {
  CommandDefinition,
  RegisteredCommandDefinition,
} from './CommandDefinition';

import type {
  EventDefinition,
  RegisteredEventDefinition,
} from './EventDefinition';

import type {
  QueryDefinition,
  RegisteredQueryDefinition,
} from './QueryDefinition';

interface PendingRequest {
  resolve: (
    value: unknown
  ) => void;

  reject: (
    error: Error
  ) => void;
}

type EventHandler =
  (
    message:
      HostEventMessage
  ) => void;

type RequestHandler =
  (
    message:
      HostRequestMessage
  ) =>
    | Promise<unknown>
    | unknown;

export interface AvailableCapabilities {
  events: RegisteredEventDefinition[];
  commands: RegisteredCommandDefinition[];
  queries: RegisteredQueryDefinition[];
}

type CapabilitiesChangedHandler =
  (
    capabilities:
      AvailableCapabilities
  ) => void;

function cloneEvent(
  event: RegisteredEventDefinition
): RegisteredEventDefinition {
  return {
    ...event,
    fields:
      event.fields?.map(
        (field) => ({
          ...field,
        })
      ),
  };
}

function cloneCommand(
  command: RegisteredCommandDefinition
): RegisteredCommandDefinition {
  return {
    ...command,
    input:
      command.input?.map(
        (field) => ({
          ...field,
        })
      ),
    output:
      command.output?.map(
        (field) => ({
          ...field,
        })
      ),
  };
}

function cloneQuery(
  query: RegisteredQueryDefinition
): RegisteredQueryDefinition {
  return {
    ...query,
    input:
      query.input?.map(
        (field) => ({
          ...field,
        })
      ),
    output:
      query.output?.map(
        (field) => ({
          ...field,
        })
      ),
  };
}

export class ModuleEventBus {
  private readonly moduleId:
    string;

  private readonly pending =
    new Map<
      string,
      PendingRequest
    >();

  private readonly eventHandlers =
    new Map<
      string,
      Set<EventHandler>
    >();

  private readonly requestHandlers =
    new Map<
      string,
      RequestHandler
    >();

private availableCapabilities:
  AvailableCapabilities = {
    events: [],
    commands: [],
    queries: [],
  };

private readonly capabilitiesChangedHandlers =
  new Set<CapabilitiesChangedHandler>();

  private readonly handleMessage =
    (
      event:
        MessageEvent
    ) => {
      const message =
        event.data as
          | HostMessage
          | undefined;

      if (!message) {
        return;
      }

      if (
        message.kind ===
        'response'
      ) {
        this.handleResponse(
          message
        );

        return;
      }

      if (
        message.kind ===
        'event'
      ) {
        if (message.type === 'capabilities.updated') {
          this.handleCapabilitiesUpdated(message);
        }

        this.dispatchEvent(message);

        return;
      }

      if (
        message.kind ===
        'request'
      ) {
        void this.handleRequest(
          message
        );
      }
    };

  constructor(
    moduleId: string
  ) {
    this.moduleId =
      moduleId;

    window.addEventListener(
      'message',
      this.handleMessage
    );
  }

  get hosted(): boolean {
    return (
      window.parent !==
      window
    );
  }

  emit(
    type: string,
    payload?: unknown
  ): void {
    if (!this.hosted) {
      return;
    }

    window.parent.postMessage(
      {
        kind: 'event',
        id:
          crypto.randomUUID(),

        sourceModuleId:
          this.moduleId,

        type,

        timestamp:
          Date.now(),

        payload,
      },
      '*'
    );
  }

  subscribe(
    type: string,
    handler:
      EventHandler
  ): () => void {
    let handlers =
      this.eventHandlers.get(
        type
      );

    if (!handlers) {
      handlers =
        new Set<EventHandler>();

      this.eventHandlers.set(
        type,
        handlers
      );
    }

    handlers.add(
      handler
    );

    return () => {
      handlers?.delete(
        handler
      );

      if (
        handlers?.size === 0
      ) {
        this.eventHandlers.delete(
          type
        );
      }
    };
  }

  registerRequestHandler(
    type: string,
    handler:
      RequestHandler
  ): () => void {
    this.requestHandlers.set(
      type,
      handler
    );

    return () => {
      if (
        this.requestHandlers.get(
          type
        ) === handler
      ) {
        this.requestHandlers.delete(
          type
        );
      }
    };
  }

  registerCapabilities(
  capabilities: {
    events?: EventDefinition[];
    commands?: CommandDefinition[];
    queries?: QueryDefinition[];
  }
): Promise<void> {
  return this.request(
    'capabilities.register',
    capabilities
  );
}

  getAvailableCapabilities():
  AvailableCapabilities {
  return {
    events:
      this.availableCapabilities.events
        .map(cloneEvent),

    commands:
      this.availableCapabilities.commands
        .map(cloneCommand),

    queries:
      this.availableCapabilities.queries
        .map(cloneQuery),
  };
}

onCapabilitiesChanged(
  handler: CapabilitiesChangedHandler
): () => void {
  this.capabilitiesChangedHandlers.add(
    handler
  );

  handler(
    this.getAvailableCapabilities()
  );

  return () => {
    this.capabilitiesChangedHandlers.delete(
      handler
    );
  };
}

  request<T>(
    type: string,
    payload?: unknown
  ): Promise<T> {
    if (!this.hosted) {
      return Promise.reject(
        new Error(
          'SettingForge host is not available.'
        )
      );
    }

    const id =
      crypto.randomUUID();

    return new Promise<T>(
      (
        resolve,
        reject
      ) => {
        this.pending.set(
          id,
          {
            resolve:
              (value) =>
                resolve(
                  value as T
                ),

            reject,
          }
        );

        window.parent.postMessage(
          {
            kind:
              'request',

            id,

            sourceModuleId:
              this.moduleId,

            type,

            timestamp:
              Date.now(),

            payload,
          },
          '*'
        );
      }
    );
  }

  command<T>(
  targetModuleId: string,
  type: string,
  payload?: unknown,
  options?: {
    focus?: boolean
  }
): Promise<T> {
  if (!this.hosted) {
    return Promise.reject(
      new Error(
        'SettingForge host is not available.'
      )
    );
  }

  if (!targetModuleId.trim()) {
    return Promise.reject(
      new Error(
        'A target module is required.'
      )
    );
  }

  const id =
    crypto.randomUUID();

  return new Promise<T>(
    (
      resolve,
      reject
    ) => {
      this.pending.set(
        id,
        {
          resolve:
            (value) =>
              resolve(
                value as T
              ),

          reject,
        }
      );

      window.parent.postMessage(
        {
          kind:
            'request',

          id,

          sourceModuleId:
            this.moduleId,

          targetModuleId,

          focusTarget: options?.focus === true,

          type,

          timestamp:
            Date.now(),

          payload,
        },
        '*'
      );
    }
  );
}

  destroy(): void {
    window.removeEventListener(
      'message',
      this.handleMessage
    );

    for (
      const pending
      of this.pending.values()
    ) {
      pending.reject(
        new Error(
          'Module event bus was destroyed.'
        )
      );
    }

    this.pending.clear();
    this.eventHandlers.clear();
    this.requestHandlers.clear();

    this.capabilitiesChangedHandlers.clear();

    this.availableCapabilities = {
      events: [],
      commands: [],
      queries: [],
    };
  }

  private handleCapabilitiesUpdated(
  message: HostEventMessage
): void {
  const payload =
    message.payload as
      | {
          events?:
            RegisteredEventDefinition[];

          commands?:
            RegisteredCommandDefinition[];

          queries?:
            RegisteredQueryDefinition[];
        }
      | undefined;

  if (
    !Array.isArray(payload?.events) ||
    !Array.isArray(payload?.commands) ||
    !Array.isArray(payload?.queries)
  ) {
    return;
  }

  this.availableCapabilities = {
    events:
      payload.events.map(
        cloneEvent
      ),

    commands:
      payload.commands.map(
        cloneCommand
      ),

    queries:
      payload.queries.map(
        cloneQuery
      ),
  };

  const snapshot =
    this.getAvailableCapabilities();

  for (
    const handler
    of this.capabilitiesChangedHandlers
  ) {
    handler({
      events:
        snapshot.events.map(
          cloneEvent
        ),

      commands:
        snapshot.commands.map(
          cloneCommand
        ),

      queries:
        snapshot.queries.map(
          cloneQuery
        ),
    });
  }
}

  private dispatchEvent(
    message:
      HostEventMessage
  ): void {
    const handlers =
      this.eventHandlers.get(
        message.type
      );

    if (!handlers) {
      return;
    }

    for (
      const handler
      of handlers
    ) {
      handler(
        message
      );
    }
  }

  private async handleRequest(
    request:
      HostRequestMessage
  ): Promise<void> {
    const handler =
      this.requestHandlers.get(
        request.type
      );

    let response:
      HostResponseMessage;

    if (!handler) {
      response = {
        kind:
          'response',

        id:
          crypto.randomUUID(),

        requestId:
          request.id,

        sourceModuleId:
          this.moduleId,

        type:
          `${request.type}.response`,

        timestamp:
          Date.now(),

        ok:
          false,

        error:
          `Module "${this.moduleId}" has no handler for "${request.type}".`,
      };
    } else {
      try {
        const payload =
          await handler(
            request
          );

        response = {
          kind:
            'response',

          id:
            crypto.randomUUID(),

          requestId:
            request.id,

          sourceModuleId:
            this.moduleId,

          type:
            `${request.type}.response`,

          timestamp:
            Date.now(),

          ok:
            true,

          payload,
        };
      } catch (error) {
        response = {
          kind:
            'response',

          id:
            crypto.randomUUID(),

          requestId:
            request.id,

          sourceModuleId:
            this.moduleId,

          type:
            `${request.type}.response`,

          timestamp:
            Date.now(),

          ok:
            false,

          error:
            error instanceof Error
              ? error.message
              : 'Module request failed.',
        };
      }
    }

    if (!this.hosted) {
      return;
    }

    window.parent.postMessage(
      response,
      '*'
    );
  }

  private handleResponse(
    response:
      HostResponseMessage
  ): void {
    const pending =
      this.pending.get(
        response.requestId
      );

    if (!pending) {
      return;
    }

    this.pending.delete(
      response.requestId
    );

    if (
      response.ok
    ) {
      pending.resolve(
        response.payload
      );

      return;
    }

    pending.reject(
      new Error(
        response.error ??
        'SettingForge request failed.'
      )
    );
  }
}
