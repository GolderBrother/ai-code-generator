import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { AiCodeGeneratorService } from './ai-code-generator.service';
import { AiCodeGeneratorFactory } from './ai-code-generator.factory';
import { ToolManager } from './tools/tool-manager';
import { FileWriteTool } from './tools/file-write.tool';
import { FileDeleteTool } from './tools/file-delete.tool';
import { ImageSearchTool } from './tools/image-search.tool';
import { LogoGeneratorTool } from './tools/logo-generator.tool';
import { MermaidDiagramTool } from './tools/mermaid-diagram.tool';

@Module({
  imports: [ConfigModule],
  providers: [
    AiService,
    AiCodeGeneratorService,
    AiCodeGeneratorFactory,
    ToolManager,
    FileWriteTool,
    FileDeleteTool,
    ImageSearchTool,
    LogoGeneratorTool,
    MermaidDiagramTool,
  ],
  exports: [AiService, AiCodeGeneratorService, AiCodeGeneratorFactory],
})
export class AiModule {}
