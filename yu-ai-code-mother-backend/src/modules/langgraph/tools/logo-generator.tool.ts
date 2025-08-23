import { Injectable } from '@nestjs/common';

@Injectable()
export class LogoGeneratorTool {
  async generateLogo(description: string): Promise<string[]> {
    // 模拟Logo生成
    const mockLogos = [
      `https://via.placeholder.com/200x200/FF6B6B/FFFFFF?text=Logo1`,
      `https://via.placeholder.com/200x200/4ECDC4/FFFFFF?text=Logo2`,
    ];
    
    return mockLogos;
  }
}