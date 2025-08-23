export interface WorkflowContext {
  workflowId: string;
  originalPrompt: string;
  userRequest: string; // 添加 userRequest 属性
  requirement: string; // 添加 requirement 属性
  enhancedPrompt: string;
  status: 'running' | 'completed' | 'failed';
  currentStep: string;
  startTime: string;
  endTime?: string;
  error?: string;
  stepResults: { [key: string]: any }; // 修改为对象类型以支持动态属性
  images: string[];
  codeGenStrategy: string;
  generatedCode: GeneratedCode;
  qualityCheck: QualityCheck;
  qualityResult: QualityCheck; // 添加 qualityResult 属性
  buildResult: BuildResult;
  projectStructure?: any; // 添加 projectStructure 属性
}

export interface StepResult {
  step: string;
  success: boolean;
  message: string;
  timestamp: string;
  data?: any;
}

export interface GeneratedCode {
  files: CodeFile[];
}

export interface CodeFile {
  path: string;
  content: string;
}

export interface QualityCheck {
  score: number;
  passed: boolean;
  issues: string[];
  suggestions?: string[];
}

export interface BuildResult {
  success: boolean;
  outputPath: string;
  deployUrl: string;
}