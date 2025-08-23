import { Injectable } from '@nestjs/common';
import { Observable, interval, map, take } from 'rxjs';

export interface WorkflowContext {
  prompt: string;
  result: string;
  status: string;
  timestamp: Date;
}

@Injectable()
export class WorkflowService {
  /**
   * 同步执行工作流
   */
  executeWorkflow(prompt: string): WorkflowContext {
    console.log('执行同步工作流:', prompt);
    
    return {
      prompt,
      result: `工作流执行完成，处理提示词: ${prompt}`,
      status: 'completed',
      timestamp: new Date(),
    };
  }

  /**
   * Flux 流式执行工作流
   */
  executeWorkflowWithFlux(prompt: string): Observable<any> {
    console.log('执行 Flux 流式工作流:', prompt);
    
    return interval(1000).pipe(
      take(5),
      map((index) => ({
        data: JSON.stringify({
          step: index + 1,
          message: `工作流步骤 ${index + 1}: 处理 "${prompt}"`,
          timestamp: new Date().toISOString(),
        }),
      }))
    );
  }

  /**
   * SSE 流式执行工作流
   */
  executeWorkflowWithSse(prompt: string): Observable<any> {
    console.log('执行 SSE 流式工作流:', prompt);
    
    return interval(1000).pipe(
      take(5),
      map((index) => ({
        data: JSON.stringify({
          step: index + 1,
          message: `SSE工作流步骤 ${index + 1}: 处理 "${prompt}"`,
          timestamp: new Date().toISOString(),
        }),
      }))
    );
  }
}