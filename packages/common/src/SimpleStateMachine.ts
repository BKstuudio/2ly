/**
 * SimpleStateMachine is a utility class that manages the state of a process switching
 * between START and STOP states with an asynchronous process
 */
export class SimpleStateMachine {
  private state: STATE = STATE.STOPPED;
  private queue: (() => Promise<void>)[] = [];
  private isTransitioning: boolean = false;
  private stateChangeListeners: ((state: STATE) => void)[] = [];

  constructor(
    private startHandler: () => Promise<void>,
    private stopHandler: () => Promise<void>,
  ) {}

  getState(): STATE {
    return this.state;
  }

  on(targetState: STATE): Promise<void> {
    if (this.state === targetState) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      const listener = (newState: STATE) => {
        if (newState === targetState) {
          this.stateChangeListeners = this.stateChangeListeners.filter((l) => l !== listener);
          resolve();
        }
      };
      this.stateChangeListeners.push(listener);
    });
  }

  start() {
    this.queue.push(async () => {
      if (this.state === STATE.STARTED) {
        return;
      }
      await this.startHandler();
      this.state = STATE.STARTED;
      this.notifyStateChange();
    });
    this.processQueue();
  }

  stop() {
    this.queue.push(async () => {
      if (this.state === STATE.STOPPED) {
        return;
      }
      await this.stopHandler();
      this.state = STATE.STOPPED;
      this.notifyStateChange();
    });
    this.processQueue();
  }

  private notifyStateChange() {
    this.stateChangeListeners.forEach((listener) => listener(this.state));
  }

  private processQueue() {
    if (this.isTransitioning || this.queue.length === 0) {
      return;
    }

    (async () => {
      this.isTransitioning = true;
      while (this.queue.length > 0) {
        await this.queue.shift()?.();
      }
      this.isTransitioning = false;
    })().catch((e) => {
      console.error(`Error while processing queue: ${e}`);
    });
  }
}

export enum STATE {
  STOPPED,
  STARTED,
}
