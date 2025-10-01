import { vi } from 'vitest';

export class LoggerMock {
    bindings() { return {}; }
    child() { return this; }
    trace = vi.fn();
    debug = vi.fn();
    info = vi.fn();
    warn = vi.fn();
    error = vi.fn();
    fatal = vi.fn();
}

export class LoggerServiceMock {
    getLogger() { return new LoggerMock(); }
}