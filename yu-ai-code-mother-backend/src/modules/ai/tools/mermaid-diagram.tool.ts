import { Injectable } from '@nestjs/common';
import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

@Injectable()
export class MermaidDiagramTool extends StructuredTool {
  schema = z.object({
    diagram_type: z.string().describe('图表类型，如：flowchart、sequence、class、er等'),
    description: z.string().describe('图表描述或需求'),
    title: z.string().optional().describe('图表标题'),
  });

  name = 'mermaid_diagram';
  description = '生成 Mermaid 格式的图表代码';

  async _call(input: z.infer<typeof this.schema>): Promise<string> {
    const { diagram_type, description, title = 'Generated Diagram' } = input;
    
    try {
      let mermaidCode = '';
      
      switch (diagram_type.toLowerCase()) {
        case 'flowchart':
          mermaidCode = `graph TD
    A[开始] --> B{判断条件}
    B -->|是| C[执行操作]
    B -->|否| D[其他操作]
    C --> E[结束]
    D --> E`;
          break;
          
        case 'sequence':
          mermaidCode = `sequenceDiagram
    participant User
    participant System
    User->>System: 请求数据
    System->>System: 处理请求
    System->>User: 返回结果`;
          break;
          
        case 'class':
          mermaidCode = `classDiagram
    class User {
        +String name
        +String email
        +login()
        +logout()
    }
    class System {
        +String version
        +process()
    }
    User --> System`;
          break;
          
        case 'er':
          mermaidCode = `erDiagram
    USER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_ITEM : contains
    USER {
        string name
        string email
    }
    ORDER {
        int id
        date created
    }`;
          break;
          
        default:
          mermaidCode = `graph TD
    A[${description}] --> B[处理逻辑]
    B --> C[输出结果]`;
      }
      
      const result = {
        success: true,
        title,
        diagram_type,
        description,
        mermaid_code: mermaidCode,
        html_embed: `<div class="mermaid">\n${mermaidCode}\n</div>`,
        usage_note: '将 mermaid_code 放入 Mermaid 渲染器中即可显示图表',
      };
      
      return JSON.stringify(result);
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error.message,
      });
    }
  }
}
