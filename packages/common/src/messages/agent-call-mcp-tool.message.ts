import { NatsMessage, NatsRequest } from '../services/nats.message';

export const AGENT_CALL_MCP_TOOL_SUBJECT = 'agent.call.tool.mcp';
const type = 'agent-call-mcp-tool';

export class AgentCallMCPToolMessage extends NatsRequest<{
  from: string; // the identity of the runtime calling for this tool execution
  toolId: string;
  arguments: Record<string, unknown>;
}> {
  static type = type;
  type = type;
  validate(data: { from: string; toolId: string; arguments: Record<string, unknown> }): boolean {
    return data.from !== undefined && data.toolId !== undefined && data.arguments !== undefined;
  }

  getSubject(): string {
    return `${AGENT_CALL_MCP_TOOL_SUBJECT}.${this.data.toolId}.${this.data.from}`;
  }

  static subscribeToAll(toolId: string): string {
    return `${AGENT_CALL_MCP_TOOL_SUBJECT}.${toolId}.*`;
  }

  static subscribeToOneRuntime(toolId: string, runtimeId: string): string {
    return `${AGENT_CALL_MCP_TOOL_SUBJECT}.${toolId}.${runtimeId}`;
  }
}

NatsMessage.register(AgentCallMCPToolMessage);
