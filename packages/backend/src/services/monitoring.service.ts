import { inject, injectable } from 'inversify';
import { LoggerService, Service, NatsService, AgentCallMCPToolMessage, AgentCallResponseMessage, dgraphResolversTypes, MCP_CALL_TOOL_TIMEOUT } from '@2ly/common';
import { DGraphService } from './dgraph.service';
import pino from 'pino';
import { MonitoringRepository } from '../repositories/monitoring.repository';

@injectable()
export class MonitoringService extends Service {

    private logger: pino.Logger;

    constructor(
        @inject(LoggerService) private loggerService: LoggerService,
        @inject(NatsService) private natsService: NatsService,
        @inject(DGraphService) private dgraphService: DGraphService,
        @inject(MonitoringRepository) private monitoringRepository: MonitoringRepository,
    ) {
        super();
        this.logger = this.loggerService.getLogger('monitoring');
    }

    protected async initialize() {
        this.logger.info('Initializing MonitoringService');
        // Monitoring service expects the NATS service to be started
        if (!this.natsService.isConnected()) {
            throw new Error('Monitoring service expects the NATS service to be started before to be initialized');
        }
        // Monitoring service expects the DGraph service to be started
        if (!this.dgraphService.isConnected()) {
            throw new Error('Monitoring service expects the DGraph service to be started before to be initialized');
        }
        this.monitorCallTools();
    }

    protected async shutdown() {
        this.logger.info('Shutting down MonitoringService');
    }

    private async monitorCallTools() {
        const messages = this.natsService.subscribe('agent.call.tool.>');
        for await (const message of messages) {

            if (message instanceof AgentCallMCPToolMessage) {
                // Persist the tool call
                this.logger.info(`TOOL CALL: ${message.originalMsg?.reply}`);
                try {
                    const promise = Promise.withResolvers<void>();
                    let toolCall: dgraphResolversTypes.ToolCall | null = null;

                    // start listening for the response immediately
                    if (message.originalMsg?.reply) {
                        (async () => {
                            this.logger.info(`Listening for the response on ${message.originalMsg!.reply!}`);
                            const response = this.natsService.subscribe(message.originalMsg!.reply!);
                            const timeout = setTimeout(async () => {
                                if (!response.isClosed()) {
                                    response.unsubscribe();
                                    await promise.promise;
                                    this.logger.error(`Tool call timed out: ${toolCall!.id}`);
                                    await this.monitoringRepository.errorToolCall(toolCall!.id, 'Timeout');
                                }
                            }, MCP_CALL_TOOL_TIMEOUT);
                            for await (const msg of response) {
                                if (msg instanceof AgentCallResponseMessage) {
                                    await promise.promise;
                                    this.logger.info(`Tool call response from ${msg.data.executedById}: ${JSON.stringify(msg.data)}`);
                                    clearTimeout(timeout);
                                    await this.monitoringRepository.completeToolCall(toolCall!.id, JSON.stringify(msg.data.result), msg.data.executedById);
                                }
                            }
                        })()
                    }
                    this.monitoringRepository.createToolCall({
                        toolInput: JSON.stringify(message.data.arguments),
                        calledById: message.data.from,
                        mcpToolId: message.data.toolId,
                    }).then((result) => {
                        toolCall = result;
                        this.logger.info(`Tool call persisted: ${toolCall.id}`);
                        promise.resolve();
                    }).catch((error) => {
                        promise.reject(error);
                    });
                } catch (error) {
                    this.logger.error(`Error monitoring tool call: ${error}`);
                }
            }


        }

    }

}