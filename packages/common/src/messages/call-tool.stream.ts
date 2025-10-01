import { NatsStream } from "../services/nats.stream";

// First attempt at streams. Not yet used.
export const callToolStream = new NatsStream('CALL_TOOLS', ['XXagent.call.tool.>']);