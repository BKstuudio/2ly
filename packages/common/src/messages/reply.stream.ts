import { NatsStream } from "../services/nats.stream";

// First attempt at streams. Not yet used.
export const replyStream = new NatsStream('XXREPLIES', ['REPLY.>']);