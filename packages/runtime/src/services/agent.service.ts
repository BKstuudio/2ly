import { inject, injectable } from 'inversify';
import pino from 'pino';
import { LoggerService, Service } from '@2ly/common';
import { AgentServerService } from './agent.server.service';

@injectable()
export class AgentService extends Service {
  name = 'agent';
  private logger: pino.Logger;
  private onInitializeMCPServerCallbacks: (() => void)[] = [];

  constructor(
    @inject(LoggerService) private loggerService: LoggerService,
    @inject(AgentServerService) private agentServerService: AgentServerService,
  ) {
    super();
    this.logger = this.loggerService.getLogger(this.name);
  }

  protected async initialize() {
    this.logger.info('Starting');
    this.agentServerService.onInitializeMCPServer(() => {
      this.onInitializeMCPServerCallbacks.forEach((callback) => callback());
    });
    await this.startService(this.agentServerService);
  }

  protected async shutdown() {
    this.logger.info('Stopping');
    await this.stopService(this.agentServerService);
  }

  public onInitializeMCPServer(callback: () => void) {
    this.onInitializeMCPServerCallbacks.push(callback);
  }
}
