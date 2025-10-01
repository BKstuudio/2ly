/* eslint-disable @typescript-eslint/no-unused-vars */
import { vi } from 'vitest';
import { Observable, Subject } from 'rxjs';

export class UrqlClientMock {
    query = vi.fn(async () => ({ data: {}, error: undefined as unknown }));
    mutation = vi.fn(async () => ({ data: {}, error: undefined as unknown }));
    subscription = vi.fn(() => ({ subscribe: (_cb: (r: unknown) => void) => ({ unsubscribe: vi.fn(() => { }) }) }));
}

export class DgraphServiceMock {
    urqlClient = new UrqlClientMock();
    start = vi.fn(async () => { });
    stop = vi.fn(async () => { });
    isConnected = vi.fn(() => true);
    initSchema = vi.fn(async () => { });
    dropAll = vi.fn(async () => ({ ok: true }));
    query = vi.fn(async (_q: unknown, _v: unknown) => ({}));
    mutation = vi.fn(async (_m: unknown, _v: unknown) => ({}));
    observe<T>(_q: unknown, _v: unknown, _k: string): Observable<T> { const s = new Subject<T>(); return s.asObservable(); }
}

export class FastifyMock {
    public routes: { method: unknown; url: string }[] = [];
    public server: unknown = {};
    route = vi.fn((opts: { method: unknown; url: string }) => { this.routes.push({ method: opts.method, url: opts.url }); });
    get = vi.fn((_url: string, _h: unknown) => { });
}

export class FastifyServiceMock {
    fastify = new FastifyMock();
    start = vi.fn(() => { });
}