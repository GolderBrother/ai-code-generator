import { Module } from '@nestjs/common';
import { LangGraphController } from './langgraph.controller';
import { LangGraphService } from './langgraph.service';
import { WorkflowExecutorService } from './services/workflow-executor.service';
import { NodeFactoryService } from './services/node-factory.service';
import { StateManagerService } from './services/state-manager.service';

// 工作流应用
import { SimpleWorkflowApp } from './workflows/simple-workflow.app';
import { SimpleStatefulWorkflowApp } from './workflows/simple-stateful-workflow.app';
import { CodeGenWorkflowApp } from './workflows/codegen-workflow.app';

// 节点类
import { ImageCollectorNode } from './nodes/image-collector.node';
import { PromptEnhancerNode } from './nodes/prompt-enhancer.node';
import { RouterNode } from './nodes/router.node';
import { CodeGeneratorNode } from './nodes/code-generator.node';
import { CodeQualityCheckNode } from './nodes/code-quality-check.node';
import { ProjectBuilderNode } from './nodes/project-builder.node';

// 工具类
import { ImageSearchTool } from './tools/image-search.tool';
import { LogoGeneratorTool } from './tools/logo-generator.tool';

@Module({
  controllers: [LangGraphController],
  providers: [
    LangGraphService,
    WorkflowExecutorService,
    NodeFactoryService,
    StateManagerService,
    // 工作流应用
    SimpleWorkflowApp,
    SimpleStatefulWorkflowApp,
    CodeGenWorkflowApp,
    // 节点类
    ImageCollectorNode,
    PromptEnhancerNode,
    RouterNode,
    CodeGeneratorNode,
    CodeQualityCheckNode,
    ProjectBuilderNode,
    // 工具类
    ImageSearchTool,
    LogoGeneratorTool,
  ],
  exports: [
    LangGraphService,
    SimpleWorkflowApp,
    SimpleStatefulWorkflowApp,
    CodeGenWorkflowApp,
  ],
})
export class LanggraphModule {}
