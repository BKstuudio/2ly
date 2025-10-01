import { NatsMessage, NatsPublish } from '../services/nats.message';
import { RUNTIME_SUBJECT } from './constants';

const type = 'healthy';

export class RuntimeHealthyMessage extends NatsPublish<{
    runtimeId: string;
}> {
    static type = type;
    type = type;
    validate(data: { runtimeId: string }): boolean {
        return data.runtimeId !== undefined;
    }

    getSubject(): string {
        return `${RUNTIME_SUBJECT}.${type}`;
    }
}

NatsMessage.register(RuntimeHealthyMessage);
