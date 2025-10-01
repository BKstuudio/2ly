import { inject, injectable } from 'inversify';
import { DGraphService } from '../services/dgraph.service';
import { dgraphResolversTypes } from '@2ly/common';
import {
  CREATE_SYSTEM,
  QUERY_SYSTEM,
  INIT_SYSTEM,
  QUERY_SYSTEM_WITH_DEFAULT_WORKSPACE,
  SET_DEFAULT_WORKSPACE,
} from './system.operations';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createSubscriptionFromQuery } from '../helpers';
import { WorkspaceRepository } from './workspace.repository';
import { UserRepository } from './user.repository';
import { v4 as uuidv4 } from 'uuid';

const INSTALL_ONBOARDING_URL = 'https://install.2ly.ai/onboarding';

@injectable()
export class SystemRepository {
  constructor(
    @inject(DGraphService) private readonly dgraphService: DGraphService,
    @inject(WorkspaceRepository) private readonly workspaceRepository: WorkspaceRepository,
    @inject(UserRepository) private readonly userRepository: UserRepository,
  ) { }

  async createSystem(): Promise<dgraphResolversTypes.System> {
    const now = new Date().toISOString();
    const instanceId = uuidv4();
    // 1. Create Admin User
    const user = await this.userRepository.create('admin', '123456');

    // 2. Create System
    const res = await this.dgraphService.mutation<{
      addSystem: { system: dgraphResolversTypes.System[] };
    }>(CREATE_SYSTEM, { now, adminId: user.id, instanceId });
    return res.addSystem.system[0];
  }

  async setDefaultWorkspace(workspaceId: string): Promise<dgraphResolversTypes.System> {
    const system = await this.getSystem();
    if (!system) {
      throw new Error('System not found');
    }
    const res = await this.dgraphService.mutation<{
      updateSystem: { system: dgraphResolversTypes.System[] };
    }>(SET_DEFAULT_WORKSPACE, { systemId: system.id, workspaceId });
    return res.updateSystem.system[0];
  }

  async getSystem(): Promise<dgraphResolversTypes.System | null> {
    const res = await this.dgraphService.query<{
      querySystem: dgraphResolversTypes.System[];
    }>(QUERY_SYSTEM_WITH_DEFAULT_WORKSPACE, {});
    return res.querySystem?.[0] || null;
  }

  /**
   * - Fetch the system and its admin user and its default workspace
   * - Update the admin user password
   * - Update the default workspace name
   * - Return the system
   */
  async initSystem(
    adminPassword: string,
    email: string,
  ): Promise<dgraphResolversTypes.System> {
    const system = await this.getSystem();
    if (!system) {
      throw new Error('System not found');
    }
    if (system.initialized || !system.defaultWorkspace || !system.admins?.[0]) {
      throw new Error(
        'Cannot initialize system. This can happen if the system was already initialized or if the default workspace or admin user was not found.',
      );
    }
    await this.userRepository.updateEmail(system.admins[0].id, email);
    await this.userRepository.updatePassword(system.admins[0].id, adminPassword);
    await this.announceInit(email, system.instanceId);
    const now = new Date().toISOString();
    const res = await this.dgraphService.mutation<{
      updateSystem: { system: dgraphResolversTypes.System[] };
    }>(INIT_SYSTEM, {
      systemId: system.id,
      now
    });
    return res.updateSystem.system[0];
  }

  private async announceInit(email: string, instanceId: string): Promise<void> {
    try {
      await fetch(INSTALL_ONBOARDING_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ instanceid: instanceId, email }),
      });
    } catch {
      return;
    }
  }

  async getDefaultWorkspace(): Promise<dgraphResolversTypes.Workspace> {
    const system = await this.getSystem();
    if (!system) {
      throw new Error('System not found');
    }
    if (!system.defaultWorkspace) {
      throw new Error('Default workspace not found');
    }
    return system.defaultWorkspace;
  }

  observeSystem(): Observable<dgraphResolversTypes.System[]> {
    const query = createSubscriptionFromQuery(QUERY_SYSTEM);
    return this.dgraphService
      .observe<dgraphResolversTypes.System>(query, {}, 'querySystem', true)
      .pipe(map((system) => [system]));
  }

  observeSystemWithDefaultWorkspace(): Observable<dgraphResolversTypes.System[]> {
    const query = createSubscriptionFromQuery(QUERY_SYSTEM_WITH_DEFAULT_WORKSPACE);
    return this.dgraphService
      .observe<dgraphResolversTypes.System>(query, {}, 'querySystem', true)
      .pipe(map((system) => [system]));
  }
}
