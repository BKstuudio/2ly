import { NatsMessage, NatsRequest } from '../services/nats.message';
import { RootIdentity } from '../types/root-identity';
import { RUNTIME_SUBJECT } from './constants';

const heartbeatType = 'heartbeat';

export class HeartbeatMessage extends NatsRequest<RootIdentity> {
  static type = heartbeatType;
  type = heartbeatType;
  validate(data: RootIdentity): boolean {
    return (
      data.name !== undefined && data.version !== undefined && data.workspaceId !== undefined
    );
  }

  getSubject(): string {
    return `${RUNTIME_SUBJECT}.${heartbeatType}`;
  }
}

NatsMessage.register(HeartbeatMessage);
