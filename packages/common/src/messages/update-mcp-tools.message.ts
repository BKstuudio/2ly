import { NatsMessage, NatsPublish } from '../services/nats.message';
import { MCPTool } from '../types/mcp-tool';
import { RUNTIME_SUBJECT } from './constants';

const type = 'update-mcp-tools';

export class UpdateMcpToolsMessage extends NatsPublish<{ mcpServerId: string; tools: MCPTool[] }> {
  static type = type;
  type = type;
  validate(data: { mcpServerId: string; tools: MCPTool[] }): boolean {
    return data.mcpServerId !== undefined && data.tools !== undefined;
  }

  getSubject(): string {
    return `${RUNTIME_SUBJECT}.${type}`;
  }
}

NatsMessage.register(UpdateMcpToolsMessage);
