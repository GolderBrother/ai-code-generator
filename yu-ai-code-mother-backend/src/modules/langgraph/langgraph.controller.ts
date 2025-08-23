import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Sse,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { LangGraphService } from './langgraph.service';
import { WorkflowExecutorService } from './services/workflow-executor.service';
import { WorkflowContext } from './types/workflow-context.interface';

@Controller('langgraph')
export class LangGraphController {
  constructor(
    private readonly langGraphService: LangGraphService,
    private readonly workflowExecutor: WorkflowExecutorService,
  ) {}

  /**
   * 同步执行代码生成工作流
   */
  @Post('execute')
  async executeWorkflow(@Body() body: { prompt: string }): Promise<WorkflowContext> {
    console.log('收到同步工作流执行请求:', body.prompt);
    return this.langGraphService.executeWorkflow(body.prompt);
  }

  /**
   * 执行并发代码生成工作流
   */
  @Post('execute-concurrent')
  async executeConcurrentWorkflow(@Body() body: { prompt: string }): Promise<WorkflowContext> {
    console.log('收到并发工作流执行请求:', body.prompt);
    return this.langGraphService.executeConcurrentWorkflow(body.prompt);
  }

  /**
   * 执行子图工作流
   */
  @Post('execute-subgraph')
  async executeSubgraphWorkflow(@Body() body: { prompt: string }): Promise<WorkflowContext> {
    console.log('收到子图工作流执行请求:', body.prompt);
    return this.langGraphService.executeSubgraphWorkflow(body.prompt);
  }

  /**
   * Flux 流式执行工作流
   */
  @Get('execute-flux')
  @Sse()
  executeWorkflowWithFlux(@Query('prompt') prompt: string): Observable<any> {
    console.log('收到 Flux 工作流执行请求:', prompt);
    return this.langGraphService.executeWorkflowWithFlux(prompt);
  }

  /**
   * SSE 流式执行工作流
   */
  @Get('execute-sse')
  @Sse()
  executeWorkflowWithSse(@Query('prompt') prompt: string): Observable<any> {
    console.log('收到 SSE 工作流执行请求:', prompt);
    return this.langGraphService.executeWorkflowWithSse(prompt);
  }

  /**
   * 获取工作流图表示
   */
  @Get('graph')
  async getWorkflowGraph(@Query('type') type: 'mermaid' | 'json' = 'mermaid') {
    const graph = await this.langGraphService.getWorkflowGraph(type);
    return {
      code: 0,
      data: graph,
      message: '获取工作流图成功',
    };
  }

  /**
   * 获取工作流状态
   */
  @Get('status/:workflowId')
  async getWorkflowStatus(@Query('workflowId') workflowId: string) {
    const status = await this.langGraphService.getWorkflowStatus(workflowId);
    return {
      code: 0,
      data: status,
      message: '获取工作流状态成功',
    };
  }
}