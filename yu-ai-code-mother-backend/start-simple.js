const { exec } = require('child_process');
const fs = require('fs');

console.log('正在启动简化版应用程序...');
console.log('这个版本不依赖数据库连接，适合在开发环境中使用');

// 编译 TypeScript 文件
console.log('正在编译 TypeScript 文件...');
const buildProcess = exec('npx nest build', (error, stdout, stderr) => {
  if (error) {
    console.error(`编译错误: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`编译警告: ${stderr}`);
  }
  
  console.log('编译完成，正在启动应用程序...');
  
  // 启动简化版应用程序
  const appProcess = exec('node dist/main.simple.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`启动错误: ${error.message}`);
      return;
    }
  });
  
  appProcess.stdout.on('data', (data) => {
    console.log(data);
  });
  
  appProcess.stderr.on('data', (data) => {
    console.error(data);
  });
});

buildProcess.stdout.on('data', (data) => {
  console.log(data);
});

buildProcess.stderr.on('data', (data) => {
  console.error(data);
});