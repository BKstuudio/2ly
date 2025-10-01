import { NatsMessage, NatsPublish } from '../services/nats.message';
import { dgraphResolversTypes } from '../graphql';
import { RUNTIME_SUBJECT } from './constants';

const type = 'update-configured-mcp-server';

export class UpdateConfiguredMCPServerMessage extends NatsPublish<{
  RID: string;
  roots: { name: string; uri: string }[];
  mcpServers: dgraphResolversTypes.McpServer[];
}> {
  static type = type;
  type = type;
  validate(data: { RID: string; roots: { name: string; uri: string }[]; mcpServers: dgraphResolversTypes.McpServer[] }): boolean {
    return data.RID !== undefined && data.mcpServers !== undefined && data.roots !== undefined;
  }

  getSubject(): string {
    return `${RUNTIME_SUBJECT}.${type}.${this.data.RID}`;
  }

  static subscribeToRID(RID: string): string {
    return `${RUNTIME_SUBJECT}.${type}.${RID}`;
  }
}

NatsMessage.register(UpdateConfiguredMCPServerMessage);
