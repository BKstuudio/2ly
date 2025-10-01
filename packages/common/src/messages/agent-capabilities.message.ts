import { NatsMessage, NatsPublish } from '../services/nats.message';
import { dgraphResolversTypes } from '../graphql';
import { RUNTIME_SUBJECT } from './constants';

const type = 'agent-capabilities';

export class AgentCapabilitiesMessage extends NatsPublish<{
  RID: string;
  capabilities: dgraphResolversTypes.McpTool[];
}> {
  static type = type;
  type = type;
  validate(data: { RID: string; capabilities: dgraphResolversTypes.McpTool[] }): boolean {
    return data.RID !== undefined && data.capabilities !== undefined;
  }

  getSubject(): string {
    return `${RUNTIME_SUBJECT}.${type}.${this.data.RID}`;
  }

  static subscribeToRID(RID: string): string {
    return `${RUNTIME_SUBJECT}.${type}.${RID}`;
  }
}

NatsMessage.register(AgentCapabilitiesMessage);
