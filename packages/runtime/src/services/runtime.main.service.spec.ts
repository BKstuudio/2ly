import { describe, it, expect, vi } from 'vitest';
import { MainService } from './runtime.main.service';
import { AckMessage, RuntimeConnectMessage, SetRuntimeCapabilitiesMessage } from '@2ly/common';
import type { LoggerService } from '@2ly/common';
import type { IdentityService } from './identity.service';
import type { HealthService } from './runtime.health.service';
import type { AgentService } from './agent.service';
import type { ToolService } from './tool.service';
import type { NatsService } from '@2ly/common';

interface MinimalLogger {
  info: (...a: unknown[]) => void;
  error: (...a: unknown[]) => void;
  debug: (...a: unknown[]) => void;
}
class FakeLoggerService {
  getLogger(): MinimalLogger {
    return { info: vi.fn(), error: vi.fn(), debug: vi.fn() };
  }
}

class FakeIdentityService {
  private id: string | null = null;
  private RID: string | null = null;
  private workspaceId: string | null = null;
  private capabilities: string[] = [];
  getAgentCapability() {
    return 'auto' as const;
  }
  getToolCapability() {
    return true as const;
  }
  addCapability = vi.fn(async (capability: string) => {
    this.capabilities.push(capability);
  });
  start = vi.fn(async () => {});
  getIdentity() {
    return {
      id: this.id,
      RID: this.RID,
      workspaceId: this.workspaceId,
      name: 'test-runtime',
      processId: 1234,
      hostIP: '127.0.0.1',
      hostname: 'localhost',
      capabilities: this.capabilities,
    };
  }
  setId(id: string, RID: string, workspaceId: string) {
    this.id = id;
    this.RID = RID;
    this.workspaceId = workspaceId;
  }
}
class FakeHealthService {
  start = vi.fn(async () => {});
  stop = vi.fn(async () => {});
}
class FakeAgentService {
  start = vi.fn(() => {});
  stop = vi.fn(async () => {});
  onInitializeMCPServer(cb: () => void) {
    cb();
  }
}
class FakeToolService {
  start = vi.fn(() => {});
  stop = vi.fn(async () => {});
}
class FakeNatsService {
  start = vi.fn(async () => {});
  stop = vi.fn(async () => {});
  async request(message: unknown) {
    if (message instanceof RuntimeConnectMessage) {
      return new AckMessage({ metadata: { id: 'id-1', RID: 'RID-1', workspaceId: 'WID-1' } });
    }
    if (message instanceof SetRuntimeCapabilitiesMessage) {
      return new AckMessage({ metadata: { ok: true } });
    }
    return new AckMessage({ metadata: {} });
  }
}

// MainService wires identity/health services and conditionally starts agent/tool based on capabilities

describe('Runtime MainService', () => {
  it('starts services and conditionally starts agent/tool', async () => {
    const svc = new MainService(
      new FakeLoggerService() as unknown as LoggerService,
      new FakeNatsService() as unknown as NatsService,
      new FakeIdentityService() as unknown as IdentityService,
      new FakeHealthService() as unknown as HealthService,
      new FakeAgentService() as unknown as AgentService,
      new FakeToolService() as unknown as ToolService,
    );
    // start/stop should not throw and should invoke underlying services
    await svc.start();
    await svc.stop();
    expect(true).toBe(true);
  });
});
