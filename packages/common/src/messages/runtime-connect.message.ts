import { NatsMessage, NatsRequest } from '../services/nats.message';
import { RUNTIME_SUBJECT } from './constants';

const type = 'connect';

export class RuntimeConnectMessage extends NatsRequest<{
    name: string;
    pid: string;
    hostIP: string;
    hostname: string;
    workspaceId: string;
}> {
    static type = type;
    type = type;
    validate(data: { name: string; pid: string; hostIP: string; hostname: string; workspaceId: string }): boolean {
        return data.name !== undefined && data.pid !== undefined && data.hostIP !== undefined && data.hostname !== undefined && data.workspaceId !== undefined;
    }

    getSubject(): string {
        return `${RUNTIME_SUBJECT}.${type}`;
    }

    static subscribe(): string {
        return `${RUNTIME_SUBJECT}.${type}`;
    }
}

NatsMessage.register(RuntimeConnectMessage);
