import { describe, it, expect } from 'vitest';
import { Container } from 'inversify';
import { LoggerService, MAIN_LOGGER_NAME, LOG_LEVEL, FORWARD_STDERR } from './logger.service';

interface MinimalLogger {
    info: (...args: unknown[]) => void;
    debug: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
}

// LoggerService creates named child loggers and resolves per-scope log levels

describe('LoggerService', () => {
    it('creates child logger with provided name', () => {
        const container = new Container();
        container.bind(MAIN_LOGGER_NAME).toConstantValue('main');
        container.bind(LOG_LEVEL).toConstantValue('info');
        container.bind(FORWARD_STDERR).toConstantValue(false);
        container.bind(LoggerService).toSelf().inSingletonScope();
        const svc = container.get(LoggerService);
        const child = svc.getLogger('test') as unknown as MinimalLogger & { level?: string };
        expect(typeof child.info).toBe('function');
    });

    it('resolves scoped log level over default', () => {
        const container = new Container();
        container.bind(MAIN_LOGGER_NAME).toConstantValue('main');
        container.bind(LOG_LEVEL).toConstantValue('warn');
        container.bind(FORWARD_STDERR).toConstantValue(false);
        container.bind(LoggerService).toSelf().inSingletonScope();
        const svc = container.get(LoggerService);
        svc.setLogLevel('test', 'debug');
        const child = svc.getLogger('test') as unknown as MinimalLogger & { level?: string };
        expect(child.level).toBe('debug');
    });
});
