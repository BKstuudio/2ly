import { SimpleStateMachine, STATE } from '../SimpleStateMachine';

/**
 * Base class for all services.
 */
export abstract class Service {
  /**
   * State machine to manage the service lifecycle.
   */
  protected state = new SimpleStateMachine(this.initialize.bind(this), this.shutdown.bind(this));

  /**
   * The date and time the service was started.
   */
  protected startedAt = new Date().toISOString();

  /**
   * Start the service.
   */
  async start() {
    this.state.start();
    return this.state.on(STATE.STARTED);
  }

  /**
   * Stop the service.
   */
  async stop() {
    this.state.stop();
    return this.state.on(STATE.STOPPED);
  }

  /**
   * Resolve when the service is STARTED
   */
  async waitForStarted() {
    return this.state.on(STATE.STARTED);
  }

  protected abstract initialize(): Promise<void>;
  protected abstract shutdown(): Promise<void>;
}
