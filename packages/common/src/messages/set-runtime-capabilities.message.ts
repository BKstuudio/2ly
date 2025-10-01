import { NatsMessage, NatsRequest } from '../services/nats.message';
import { RUNTIME_SUBJECT } from './constants';

const type = 'set-runtime-capabilities';

export class SetRuntimeCapabilitiesMessage extends NatsRequest<{
    RID: string;
    capabilities: string[];
}> {
    static type = type;
    type = type;
    validate(data: { RID: string; capabilities: string[] }): boolean {
        return data.RID !== undefined && data.capabilities !== undefined;
    }

    getSubject(): string {
        return `${RUNTIME_SUBJECT}.${this.data.RID}.${type}`;
    }
}

NatsMessage.register(SetRuntimeCapabilitiesMessage);
