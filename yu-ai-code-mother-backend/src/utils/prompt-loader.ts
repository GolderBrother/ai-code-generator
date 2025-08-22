import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * 加载系统提示词文件
 * @param filename 提示词文件名
 * @returns 提示词内容
 */
export async function loadSystemPrompt(filename: string): Promise<string> {
  try {
    const promptPath = path.join(process.cwd(), 'src', 'resources', 'prompt', filename);
    const content = await fs.readFile(promptPath, 'utf8');
    return content.trim();
  } catch (error) {
    console.warn(`无法加载提示词文件 ${filename}:`, error.message);
    // 返回默认提示词
    return getDefaultPrompt(filename);
  }
}

/**
 * 获取默认提示词
 * @param filename 文件名
 * @returns 默认提示词
 */
function getDefaultPrompt(filename: string): string {
  const defaultPrompts: Record<string, string> = {
    'codegen-html-system-prompt.txt': `你是一个专业的 Web 前端开发专家，擅长 HTML、CSS 和 JavaScript 开发。

请根据用户的需求描述，生成完整的、可直接使用的网页代码。

要求：
1. 代码要完整，包含 HTML、CSS 和 JavaScript
2. 代码要规范，遵循最佳实践
3. 代码要响应式，适配不同设备
4. 代码要有良好的用户体验

请按照以下格式返回：
\`\`\`html
<!-- HTML 代码 -->
\`\`\`

\`\`\`css
/* CSS 样式 */
\`\`\`

\`\`\`javascript
// JavaScript 代码
\`\`\``,

    'codegen-multi-file-system-prompt.txt': `你是一个专业的全栈开发专家，擅长多种编程语言和框架。

请根据用户的需求描述，生成一个完整的项目，包含多个文件。

要求：
1. 项目结构要清晰合理
2. 代码要规范，遵循最佳实践
3. 要包含必要的配置文件
4. 要包含 README 文档

请按照以下格式返回：
文件1: [文件路径]
\`\`\`[语言]
[文件内容]
\`\`\`

文件2: [文件路径]
\`\`\`[语言]
[文件内容]
\`\`\`

...`,

    'codegen-vue-project-system-prompt.txt': `你是一个专业的 Vue.js 开发专家，擅长 Vue 3 + TypeScript 开发。

请根据用户的需求描述，生成一个完整的 Vue 项目。

要求：
1. 使用 Vue 3 + TypeScript
2. 使用 Composition API
3. 项目结构要清晰合理
4. 代码要规范，遵循最佳实践
5. 要包含必要的配置文件
6. 要包含 README 文档

请按照以下格式返回：
文件1: [文件路径]
\`\`\`[语言]
[文件内容]
\`\`\`

文件2: [文件路径]
\`\`\`[语言]
[文件内容]
\`\`\`

...`,
  };

  return defaultPrompts[filename] || `请根据用户需求生成相应的代码。`;
}
