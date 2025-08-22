import { Injectable } from '@nestjs/common';
import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import * as fs from 'fs/promises';

@Injectable()
export class FileDeleteTool extends Tool {
  schema = z.object({
    file_path: z.string().describe('要删除的文件路径'),
  });

  name = 'file_delete';
  description = '删除指定的文件';

  async _call(input: z.infer<typeof this.schema>): Promise<string> {
    const { file_path } = input;
    
    try {
      await fs.unlink(file_path);
      return `文件 ${file_path} 删除成功`;
    } catch (error) {
      return `文件删除失败: ${error.message}`;
    }
  }
}
