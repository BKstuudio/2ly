import { inject, injectable } from 'inversify';
import { DGraphService } from '../services/dgraph.service';
import { apolloResolversTypes, dgraphResolversTypes } from '@2ly/common';
import { ADD_TOOL_CALL, COMPLETE_TOOL_CALL_ERROR, COMPLETE_TOOL_CALL_SUCCESS, QUERY_TOOL_CALLS } from './monitoring.operations';
import { map, Observable } from 'rxjs';
import { createSubscriptionFromQuery } from '../helpers';

@injectable()
export class MonitoringRepository {
    constructor(@inject(DGraphService) private readonly dgraphService: DGraphService) { }

    async createToolCall(params: {
        calledById: string;
        toolInput: string;
        mcpToolId: string;
    }): Promise<dgraphResolversTypes.ToolCall> {
        const now = new Date().toISOString();
        const res = await this.dgraphService.mutation<{
            addToolCall: { toolCall: dgraphResolversTypes.ToolCall[] };
        }>(ADD_TOOL_CALL, {
            toolInput: params.toolInput,
            calledAt: now,
            calledById: params.calledById,
            mcpToolId: params.mcpToolId
        });
        return res.addToolCall.toolCall[0];
    }

    async completeToolCall(id: string, toolOutput: string, executedById: string): Promise<dgraphResolversTypes.ToolCall> {
        const completedAt = new Date().toISOString();
        const res = await this.dgraphService.mutation<{
            updateToolCall: { toolCall: dgraphResolversTypes.ToolCall[] };
        }>(COMPLETE_TOOL_CALL_SUCCESS, { id, toolOutput, completedAt, executedById });
        return res.updateToolCall.toolCall[0];
    }

    async errorToolCall(id: string, errorMessage: string): Promise<dgraphResolversTypes.ToolCall> {
        const completedAt = new Date().toISOString();
        const res = await this.dgraphService.mutation<{
            updateToolCall: { toolCall: dgraphResolversTypes.ToolCall[] };
        }>(COMPLETE_TOOL_CALL_ERROR, { id, error: errorMessage, completedAt });
        return res.updateToolCall.toolCall[0];
    }

    observeToolCalls(workspaceId: string): Observable<apolloResolversTypes.ToolCall[]> {
        const query = createSubscriptionFromQuery(QUERY_TOOL_CALLS);
        return this.dgraphService
            .observe<{ mcpTools: dgraphResolversTypes.McpTool[] }>(query, { workspaceId }, 'getWorkspace', true)
            .pipe(map((workspace) => workspace.mcpTools.flatMap((mcpTool) => mcpTool.toolCalls).filter(x => x !== null && x !== undefined) || []));
    }
}


