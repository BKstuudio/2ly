import { NatsMessage, NatsRequest } from '../services/nats.message';
import { RUNTIME_SUBJECT } from './constants';

const type = 'set-mcp-client-name';

export class SetMcpClientNameMessage extends NatsRequest<{
    RID: string;
    mcpClientName: string;
}> {
    static type = type;
    type = type;
    validate(data: { RID: string; mcpClientName: string }): boolean {
        return data.RID !== undefined && data.mcpClientName !== undefined;
    }

    getSubject(): string {
        return `${RUNTIME_SUBJECT}.${this.data.RID}.${type}`;
    }
}

NatsMessage.register(SetMcpClientNameMessage);
