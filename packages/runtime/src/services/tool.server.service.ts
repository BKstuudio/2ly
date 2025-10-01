import { injectable } from 'inversify';
import pino from 'pino';
import { Service, dgraphResolversTypes, MCPTool } from '@2ly/common';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport, getDefaultEnvironment } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { Observable, BehaviorSubject } from 'rxjs';
import { ListRootsRequestSchema, ToolListChangedNotificationSchema } from '@modelcontextprotocol/sdk/types.js';

@injectable()
export class ToolServerService extends Service {
  private client: Client;
  private transport: Transport;
  private tools: BehaviorSubject<MCPTool[]> = new BehaviorSubject<MCPTool[]>([]);
  private onShutdownCallback: () => Promise<void> = async () => {};

  constructor(
    private logger: pino.Logger,
    private config: dgraphResolversTypes.McpServer,
    private roots: { name: string; uri: string }[] = [],
  ) {
    super();
    this.logger.info(`Initializing MCP server service for ${this.config.name}`);
    this.client = new Client(
      {
        name: this.config.name,
        version: '1.0.0',
      },
      {
        capabilities: {
          roots: {
            listChanged: true,
          },
        },
      },
    );

    this.client.setRequestHandler(ListRootsRequestSchema, async () => {
      this.logger.debug(
        `Handling ListRootsRequest for ${this.config.name}, returning roots: ${JSON.stringify(this.roots)}`,
      );
      return {
        roots: this.roots,
      };
    });

    if (this.config.transport === dgraphResolversTypes.McpTransportType.Stdio) {
      this.logger.debug(`Setting STDIO transport with command: ${this.config.command} and args: ${this.config.args}`);
      const defaultEnv = getDefaultEnvironment();
      this.logger.debug(`Default environment: ${JSON.stringify(defaultEnv, null, 2)}`);

      this.transport = new StdioClientTransport({
        command: this.config.command,
        args: this.config.args.split(' '),
        env: this.config.ENV.split(' ').reduce((acc, curr) => {
          const [key, value] = curr.split('=');
          acc[key] = value;
          return acc;
        }, defaultEnv),
      });
    } else if (this.config.transport === dgraphResolversTypes.McpTransportType.Stream) {
      this.logger.debug(`Setting Streamable HTTP transport with server URL: ${this.config.serverUrl}`);
      this.logger.debug(`Headers: ${this.config.headers}`);

      const parseHeaders = (headers: string) => {
        return headers.split('\n').reduce((acc, curr) => {
          const words = curr.trim().split(': ');
          if (words.length === 0) {
            return acc;
          }
          acc.set(words[0].replace(/:$/, ''), words.slice(1).join(' '));
          return acc;
        }, new Map<string, string>());
      };

      const requestInit: RequestInit = {
        headers: Object.fromEntries(parseHeaders(this.config.headers ?? '')),
      };

      this.transport = new StreamableHTTPClientTransport(new URL(this.config.serverUrl), {
        requestInit,
      });
    } else {
      throw new Error(`Unknown MCP server type: ${this.config.transport}, only STDIO and STREAM are supported`);
    }
  }

  observeTools(): Observable<MCPTool[]> {
    return this.tools.asObservable();
  }

  protected async initialize() {
    this.logger.info(`Starting with transport: ${this.transport}`);
    await this.client.connect(this.transport);
    this.logger.debug('Connected to MCP server');
    const originalTools = await this.client.listTools();
    this.tools.next(originalTools.tools);

    this.client.setNotificationHandler(ToolListChangedNotificationSchema, async () => {
      const updatedTools = await this.client.listTools();
      this.tools.next(updatedTools.tools);
    });
  }

  protected async shutdown() {
    this.logger.info('Stopping');
    this.tools.complete();
    await this.onShutdownCallback();
    this.client.close();
    this.logger.debug('Disconnected');
  }

  onShutdown(callback: () => Promise<void>) {
    this.onShutdownCallback = callback;
  }

  callCapability(toolCall: { name: string; arguments: Record<string, unknown> }): Promise<unknown> {
    return this.client.callTool({
      name: toolCall.name,
      arguments: toolCall.arguments,
    });
  }

  getName(): string {
    return this.config.name;
  }

  getConfigSignature(): string {
    return `${this.config.transport} ${this.config.command} ${this.config.args} ${this.config.ENV} ${this.config.serverUrl}`;
  }

  updateRoots(roots: { name: string; uri: string }[]) {
    this.logger.debug(`Updating ${this.config.name} roots: ${JSON.stringify(roots)}`);
    this.roots = roots;
    this.client.sendRootsListChanged();
  }
}

export type ToolServerServiceFactory = (
  config: dgraphResolversTypes.McpServer,
  roots: { name: string; uri: string }[],
) => ToolServerService;
