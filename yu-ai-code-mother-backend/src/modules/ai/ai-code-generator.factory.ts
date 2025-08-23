import { Injectable } from '@nestjs/common';
import { AiCodeGeneratorService } from './ai-code-generator.service';

export interface CodeGenerator {
  generate(request: any): Promise<any>;
  getSupportedTypes(): string[];
}

export class HtmlCodeGenerator implements CodeGenerator {
  constructor(private readonly aiService: AiCodeGeneratorService) {}

  async generate(request: any): Promise<any> {
    return this.aiService.generateCode({
      prompt: request.prompt,
      codeType: 'html',
    });
  }

  getSupportedTypes(): string[] {
    return ['html', 'css', 'javascript'];
  }
}

export class MultiFileCodeGenerator implements CodeGenerator {
  constructor(private readonly aiService: AiCodeGeneratorService) {}

  async generate(request: any): Promise<any> {
    return this.aiService.generateCode({
      prompt: request.prompt,
      codeType: 'multi-file',
      framework: request.framework,
      features: request.features,
    });
  }

  getSupportedTypes(): string[] {
    return ['html', 'css', 'javascript', 'json', 'md'];
  }
}

export class ReactCodeGenerator implements CodeGenerator {
  constructor(private readonly aiService: AiCodeGeneratorService) {}

  async generate(request: any): Promise<any> {
    return this.aiService.generateCode({
      prompt: request.prompt,
      codeType: 'react',
      framework: 'react',
      features: request.features,
    });
  }

  getSupportedTypes(): string[] {
    return ['jsx', 'tsx', 'css', 'json'];
  }
}

export class VueCodeGenerator implements CodeGenerator {
  constructor(private readonly aiService: AiCodeGeneratorService) {}

  async generate(request: any): Promise<any> {
    return this.aiService.generateCode({
      prompt: request.prompt,
      codeType: 'vue',
      framework: 'vue',
      features: request.features,
    });
  }

  getSupportedTypes(): string[] {
    return ['vue', 'js', 'css', 'json'];
  }
}

@Injectable()
export class AiCodeGeneratorFactory {
  constructor(private readonly aiService: AiCodeGeneratorService) {}

  createGenerator(type: string): CodeGenerator {
    switch (type.toLowerCase()) {
      case 'html':
        return new HtmlCodeGenerator(this.aiService);
      case 'multi-file':
        return new MultiFileCodeGenerator(this.aiService);
      case 'react':
        return new ReactCodeGenerator(this.aiService);
      case 'vue':
        return new VueCodeGenerator(this.aiService);
      default:
        return new MultiFileCodeGenerator(this.aiService);
    }
  }

  getSupportedTypes(): string[] {
    return ['html', 'multi-file', 'react', 'vue'];
  }
}