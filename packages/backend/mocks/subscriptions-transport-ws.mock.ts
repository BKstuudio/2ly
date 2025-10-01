import { vi } from 'vitest';

vi.mock('subscriptions-transport-ws', () => ({
    SubscriptionClient: class {
        constructor() { }
        close() { }
        request() { return { subscribe: () => ({ unsubscribe: () => { } }) }; }
    },
}));