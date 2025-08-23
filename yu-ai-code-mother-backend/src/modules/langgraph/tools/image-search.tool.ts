import { Injectable } from '@nestjs/common';

@Injectable()
export class ImageSearchTool {
  async searchImages(query: string): Promise<string[]> {
    // 模拟图片搜索
    const mockImages = [
      `https://picsum.photos/400/300?random=1&query=${encodeURIComponent(query)}`,
      `https://picsum.photos/400/300?random=2&query=${encodeURIComponent(query)}`,
      `https://picsum.photos/400/300?random=3&query=${encodeURIComponent(query)}`,
    ];
    
    return mockImages;
  }
}