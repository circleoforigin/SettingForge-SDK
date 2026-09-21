import type {
  HostEventMessage,
  HostMessage,
  HostRequestMessage,
  HostResponseMessage,
} from './HostMessage';
import type {
  ActionDefinition,
  RegisteredActionDefinition,
} from './ActionDefinition';

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

type ActionsChangedHandler =
  (actions: RegisteredActionDefinition[]) => void;

function cloneAction(
  action: RegisteredActionDefinition
): RegisteredActionDefinition {
  return {
    ...action,
    fields: action.fields?.map((field) => ({ ...field })),
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

  private availableActions: RegisteredActionDefinition[] = [];

  private readonly actionsChangedHandlers =
    new Set<ActionsChangedHandler>();

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
        if (message.type === 'actions.updated') {
          this.handleActionsUpdated(message);
        }

        this.dispatchEvent(
          message
        );

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

  registerActions(actions: ActionDefinition[]): Promise<void> {
    return this.request<void>('actions.register', { actions });
  }

  getAvailableActions(): RegisteredActionDefinition[] {
    return this.availableActions.map(cloneAction);
  }

  onActionsChanged(handler: ActionsChangedHandler): () => void {
    this.actionsChangedHandlers.add(handler);
    handler(this.getAvailableActions());

    return () => {
      this.actionsChangedHandlers.delete(handler);
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
    this.actionsChangedHandlers.clear();
    this.availableActions = [];
  }

  private handleActionsUpdated(message: HostEventMessage): void {
    const payload = message.payload as {
      actions?: RegisteredActionDefinition[];
    } | undefined;
    if (!Array.isArray(payload?.actions)) return;

    this.availableActions = payload.actions.map(cloneAction);
    const snapshot = this.getAvailableActions();
    for (const handler of this.actionsChangedHandlers) {
      handler(snapshot.map(cloneAction));
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
