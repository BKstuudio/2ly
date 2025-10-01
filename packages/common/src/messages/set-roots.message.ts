import { NatsMessage, NatsRequest } from '../services/nats.message';
import { RUNTIME_SUBJECT } from './constants';

const type = 'set-roots';

export class SetRootsMessage extends NatsRequest<{
    RID: string;
    roots: { name: string; uri: string }[];
}> {
    static type = type;
    type = type;
    validate(data: { RID: string; roots: { name: string; uri: string }[] }): boolean {
        return data.RID !== undefined && data.roots !== undefined;
    }

    getSubject(): string {
        return `${RUNTIME_SUBJECT}.${this.data.RID}.${type}`;
    }
}

NatsMessage.register(SetRootsMessage);
