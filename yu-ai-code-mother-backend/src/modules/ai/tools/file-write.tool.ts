import { Injectable } from '@nestjs/common';
import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class FileWriteTool extends Tool {
  schema = z.object({
    file_path: z.string().describe('文件路径'),
    content: z.string().describe('文件内容'),
  });

  name = 'file_write';
  description = '将内容写入文件';

  async _call(input: z.infer<typeof this.schema>): Promise<string> {
    const { file_path, content } = input;
    
    try {
      // 确保目录存在
      const dir = path.dirname(file_path);
      await fs.mkdir(dir, { recursive: true });
      
      // 写入文件
      await fs.writeFile(file_path, content, 'utf8');
      
      return `文件 ${file_path} 写入成功`;
    } catch (error) {
      return `文件写入失败: ${error.message}`;
    }
  }
}
