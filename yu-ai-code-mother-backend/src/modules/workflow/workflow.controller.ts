import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Sse,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { WorkflowService } from './workflow.service';

@Controller('workflow')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  /**
   * 同步执行工作流
   */
  @Post('execute')
  async executeWorkflow(@Body() body: { prompt: string }) {
    console.log('收到同步工作流执行请求:', body.prompt);
    return this.workflowService.executeWorkflow(body.prompt);
  }

  /**
   * Flux 流式执行工作流
   */
  @Get('execute-flux')
  @Sse()
  executeWorkflowWithFlux(@Query('prompt') prompt: string): Observable<any> {
    console.log('收到 Flux 工作流执行请求:', prompt);
    return this.workflowService.executeWorkflowWithFlux(prompt);
  }

  /**
   * SSE 流式执行工作流
   */
  @Get('execute-sse')
  @Sse()
  executeWorkflowWithSse(@Query('prompt') prompt: string): Observable<any> {
    console.log('收到 SSE 工作流执行请求:', prompt);
    return this.workflowService.executeWorkflowWithSse(prompt);
  }
}