import { vi } from 'vitest';

vi.mock('urql', () => {
    class MockClient {
        query = vi.fn(async () => ({ data: {}, error: undefined }));
        mutation = vi.fn(async () => ({ data: {}, error: undefined }));
        subscription = vi.fn(() => ({ subscribe: () => ({ unsubscribe: vi.fn() }) }));
    }
    return {
        Client: MockClient,
        subscriptionExchange: () => (forward: unknown) => forward,
        fetchExchange: {},
    } as unknown as Record<string, unknown>;
});