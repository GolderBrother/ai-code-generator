import { Injectable } from "@nestjs/common";
import {
  CodeFileSaverTemplate,
  FileDirectory,
} from "./code-file-saver.template";
import { CodeGenTypeEnum } from "../../../common/enums/code-gen-type.enum";
import * as path from "path";
import * as fs from "fs";

/**
 * Vue 项目文件保存器
 * 对齐 Java 版本的 Vue 项目保存逻辑
 */
@Injectable()
export class VueProjectFileSaver extends CodeFileSaverTemplate<any> {
  protected getCodeType(): string {
    return CodeGenTypeEnum.VUE_PROJECT;
  }

  protected saveFiles(result: any, baseDirPath: string): void {
    // 创建基础 Vue 项目文件
    this.createBasicVueFiles(baseDirPath);

    // 如果有项目内容，保存项目内容
    if (result && result.projectContent) {
      this.writeToFile(baseDirPath, "README.md", result.projectContent);
    }
  }

  protected validateInput(result: any): void {
    super.validateInput(result);
    // Vue 项目可以接受空内容，会生成默认结构
  }

  /**
   * 创建基础 Vue 文件
   */
  private createBasicVueFiles(baseDirPath: string): void {
    // 创建 src 目录
    const srcDir = path.join(baseDirPath, "src");
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir, { recursive: true });
    }

    // package.json
    const packageJson = {
      name: `vue-project-${Date.now()}`,
      version: "1.0.0",
      scripts: {
        dev: "vite",
        build: "vite build",
        preview: "vite preview",
      },
      dependencies: {
        vue: "^3.3.0",
      },
      devDependencies: {
        "@vitejs/plugin-vue": "^4.0.0",
        vite: "^4.0.0",
      },
    };
    this.writeToFile(
      baseDirPath,
      "package.json",
      JSON.stringify(packageJson, null, 2)
    );

    // vite.config.js
    const viteConfig = `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true
  }
})`;
    this.writeToFile(baseDirPath, "vite.config.js", viteConfig);

    // index.html
    const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vue Project</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>`;
    this.writeToFile(baseDirPath, "index.html", indexHtml);

    // src/main.js
    const mainJs = `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`;
    this.writeToFile(srcDir, "main.js", mainJs);

    // src/App.vue
    const appVue = `<template>
  <div id="app">
    <h1>Vue 项目已创建</h1>
    <p>这是一个由 AI 生成的 Vue 项目</p>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>`;
    this.writeToFile(srcDir, "App.vue", appVue);
  }

  /**
   * 静态方法，保持向后兼容
   */
  static async saveVueProjectResult(
    vueProjectResult: any,
    appId: number
  ): Promise<{ getAbsolutePath: () => string }> {
    const saver = new VueProjectFileSaver();
    const fileDirectory = saver.saveCode(vueProjectResult, appId);

    return {
      getAbsolutePath: () => fileDirectory.getAbsolutePath(),
    };
  }
}
