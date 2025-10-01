import { NatsMessage, NatsRequest } from '../services/nats.message';
import { RUNTIME_SUBJECT } from './constants';

const type = 'set-default-testing-runtime';

export class SetDefaultTestingRuntimeMessage extends NatsRequest<{ RID: string }> {
    static type = type;
    type = type;

    validate(data: { RID: string }): boolean {
        return typeof data === 'object' && data.RID !== undefined && typeof data.RID === 'string';
    }

    getSubject(): string {
        return `${RUNTIME_SUBJECT}.${this.data.RID}.${type}`;
    }
}

NatsMessage.register(SetDefaultTestingRuntimeMessage);