/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegistryRepository } from './registry.repository';
import { readFileSync } from 'fs';

// Mock fs module
vi.mock('fs', () => ({
    readFileSync: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

describe('RegistryRepository', () => {
    let registryRepository: RegistryRepository;

    beforeEach(() => {
        registryRepository = new RegistryRepository();
        vi.clearAllMocks();
    });

    it('getDefaultRegistryPath returns correct path', () => {
        const result = registryRepository.getDefaultRegistryPath();

        expect(result).toContain('data');
        expect(result).toContain('mcp-server-catalog.json');
        expect(result).toContain('src');
    });

    it('getRegistry reads local file when type is local', async () => {
        const mockContent = '{"servers": []}';
        const filePath = '/path/to/registry.json';

        (readFileSync as any).mockReturnValue(mockContent);

        const result = await registryRepository.getRegistry(filePath, 'local');

        expect(readFileSync).toHaveBeenCalledWith(filePath, 'utf-8');
        expect(result).toBe(mockContent);
    });

    it('getRegistry fetches remote content when type is remote', async () => {
        const mockContent = '{"servers": []}';
        const url = 'https://example.com/registry.json';

        (global.fetch as any).mockResolvedValue({
            text: () => Promise.resolve(mockContent),
        });

        const result = await registryRepository.getRegistry(url, 'remote');

        expect(global.fetch).toHaveBeenCalledWith(url);
        expect(result).toBe(mockContent);
    });

    it('getRegistry handles fetch errors for remote type', async () => {
        const url = 'https://example.com/registry.json';
        const error = new Error('Network error');

        (global.fetch as any).mockRejectedValue(error);

        await expect(registryRepository.getRegistry(url, 'remote'))
            .rejects.toThrow('Network error');
    });

    it('getRegistry handles readFileSync errors for local type', async () => {
        const filePath = '/nonexistent/path.json';
        const error = new Error('ENOENT: no such file or directory');

        (readFileSync as any).mockImplementation(() => {
            throw error;
        });

        await expect(registryRepository.getRegistry(filePath, 'local'))
            .rejects.toThrow('ENOENT: no such file or directory');
    });
});
