/* eslint-disable @typescript-eslint/no-unused-vars */
import { vi } from 'vitest';
import { ControllableAsyncIterator, FakeNatsSubscription } from '../test/utils';

export class NatsServiceMock {
    constructor(private iterator: ControllableAsyncIterator<unknown>) { }
    start = vi.fn(async () => { });
    stop = vi.fn(async () => { });
    isConnected = vi.fn(() => true);
    publish = vi.fn((_msg: unknown) => { });
    request = vi.fn(async () => { });
    heartbeatKeys = vi.fn(async () => [] as string[]);
    subscribe = vi.fn(() => new FakeNatsSubscription(this.iterator));
}