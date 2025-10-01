import { injectable } from 'inversify';
import { readFileSync } from 'fs';
import path from 'path';

@injectable()
export class RegistryRepository {
  constructor() { }

  getDefaultRegistryPath(): string {
    return path.join(__dirname, '..', 'data', 'mcp-server-catalog.json');
  }

  async getRegistry(path: string, type: 'local' | 'remote'): Promise<string> {
    if (type === 'local') {
      return readFileSync(path, 'utf-8');
    }
    return fetch(path).then(res => res.text());
  }

}
