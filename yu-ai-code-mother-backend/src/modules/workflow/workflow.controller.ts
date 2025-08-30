import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';

/**
 * 工作流控制器
 * 对齐Java版本的工作流管理功能
 */
@Controller('workflow')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  /**
   * 获取所有工作流
   */
  @Get()
  async getAllWorkflows() {
    return this.workflowService.getWorkflowList();
  }

  /**
   * 根据ID获取工作流
   */
  @Get(':id')
  async getWorkflowById(@Param('id') id: string) {
    return this.workflowService.getWorkflowById(id);
  }

  /**
   * 创建工作流
   */
  @Post()
  async createWorkflow(@Body() createWorkflowDto: CreateWorkflowDto) {
    return this.workflowService.createWorkflow(createWorkflowDto);
  }

  /**
   * 更新工作流
   */
  @Put(':id')
  async updateWorkflow(
    @Param('id') id: string,
    @Body() updateData: any,
  ) {
    return this.workflowService.updateWorkflow(id, updateData);
  }

  /**
   * 删除工作流
   */
  @Delete(':id')
  async deleteWorkflow(@Param('id') id: string) {
    return this.workflowService.deleteWorkflow(id);
  }

  /**
   * 执行工作流
   */
  @Post(':id/execute')
  async executeWorkflow(
    @Param('id') id: string,
    @Body() params: any,
  ) {
    return this.workflowService.executeWorkflow(id, params);
  }

  /**
   * 获取工作流执行历史
   */
  @Get(':id/history')
  async getWorkflowHistory(@Param('id') id: string) {
    // 这个方法需要在服务中实现
    return { message: '工作流执行历史功能待实现' };
  }
}