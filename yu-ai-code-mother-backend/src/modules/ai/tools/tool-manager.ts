import { Injectable } from '@nestjs/common';
import { Tool } from '@langchain/core/tools';
import { FileWriteTool } from './file-write.tool';
import { FileDeleteTool } from './file-delete.tool';
import { ImageSearchTool } from './image-search.tool';
import { LogoGeneratorTool } from './logo-generator.tool';
import { MermaidDiagramTool } from './mermaid-diagram.tool';

@Injectable()
export class ToolManager {
  constructor(
    private readonly fileWriteTool: FileWriteTool,
    private readonly fileDeleteTool: FileDeleteTool,
    private readonly imageSearchTool: ImageSearchTool,
    private readonly logoGeneratorTool: LogoGeneratorTool,
    private readonly mermaidDiagramTool: MermaidDiagramTool,
  ) {}

  getAllTools(): Tool[] {
    return [
      this.fileWriteTool,
      this.fileDeleteTool,
      this.imageSearchTool,
      this.logoGeneratorTool,
      this.mermaidDiagramTool,
    ];
  }

  getToolByName(name: string): Tool | undefined {
    return this.getAllTools().find(tool => tool.name === name);
  }
}
