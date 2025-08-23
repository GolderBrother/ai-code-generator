const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

console.log('=== 数据库设置向导 ===');

// 创建交互式命令行界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 检查SQL文件
const sqlFilePath = path.join(__dirname, '../sql/create_table.sql');
if (!fs.existsSync(sqlFilePath)) {
  console.error(`错误: SQL文件不存在: ${sqlFilePath}`);
  console.log(`尝试在当前目录查找: ${path.join(__dirname, 'sql/create_table.sql')}`);
  
  if (fs.existsSync(path.join(__dirname, 'sql/create_table.sql'))) {
    console.log('在当前目录找到SQL文件');
  } else {
    console.error('无法找到SQL文件，请确保SQL文件存在');
  }
}

// 主菜单
function showMainMenu() {
  console.log('\n=== 主菜单 ===');
  console.log('1. 创建数据库和表');
  console.log('2. 修改数据库配置');
  console.log('3. 启动测试服务器');
  console.log('4. 启动完整应用');
  console.log('5. 退出');
  
  rl.question('请选择操作 (1-5): ', (answer) => {
    switch(answer) {
      case '1':
        setupDatabase();
        break;
      case '2':
        updateDatabaseConfig();
        break;
      case '3':
        startTestServer();
        break;
      case '4':
        startFullApp();
        break;
      case '5':
        console.log('再见!');
        rl.close();
        break;
      default:
        console.log('无效选择，请重试');
        showMainMenu();
    }
  });
}

// 创建数据库和表
function setupDatabase() {
  console.log('\n=== 创建数据库和表 ===');
  console.log('请按照以下步骤手动创建数据库和表:');
  console.log('1. 登录MySQL: mysql -u root -p');
  console.log('2. 创建数据库: CREATE DATABASE IF NOT EXISTS yu_ai_code_mother CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
  console.log('3. 使用数据库: USE yu_ai_code_mother;');
  console.log('4. 创建表: 复制并执行 sql/create_table.sql 中的建表语句');
  console.log('\n或者使用以下命令一次性导入:');
  console.log('mysql -u root -p < sql/create_table.sql');
  
  rl.question('\n按回车键返回主菜单...', () => {
    showMainMenu();
  });
}

// 修改数据库配置
function updateDatabaseConfig() {
  console.log('\n=== 修改数据库配置 ===');
  console.log('请确保 env.local 文件中的数据库配置正确:');
  console.log('DATABASE_HOST=localhost');
  console.log('DATABASE_PORT=3306');
  console.log('DATABASE_USERNAME=root');
  console.log('DATABASE_PASSWORD=你的MySQL密码');
  console.log('DATABASE_NAME=yu_ai_code_mother');
  
  rl.question('\n是否要编辑 env.local 文件? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      rl.question('请输入数据库主机 (默认: localhost): ', (host) => {
        host = host || 'localhost';
        rl.question('请输入数据库端口 (默认: 3306): ', (port) => {
          port = port || '3306';
          rl.question('请输入数据库用户名 (默认: root): ', (username) => {
            username = username || 'root';
            rl.question('请输入数据库密码: ', (password) => {
              password = password || 'root';
              
              // 读取现有的env.local文件
              const envPath = path.join(__dirname, 'env.local');
              if (fs.existsSync(envPath)) {
                let envContent = fs.readFileSync(envPath, 'utf8');
                
                // 替换数据库配置
                envContent = envContent.replace(/DATABASE_HOST=.*/g, `DATABASE_HOST=${host}`);
                envContent = envContent.replace(/DATABASE_PORT=.*/g, `DATABASE_PORT=${port}`);
                envContent = envContent.replace(/DATABASE_USERNAME=.*/g, `DATABASE_USERNAME=${username}`);
                envContent = envContent.replace(/DATABASE_PASSWORD=.*/g, `DATABASE_PASSWORD=${password}`);
                
                // 写回文件
                fs.writeFileSync(envPath, envContent);
                console.log('数据库配置已更新!');
              } else {
                console.error('env.local 文件不存在!');
              }
              
              showMainMenu();
            });
          });
        });
      });
    } else {
      showMainMenu();
    }
  });
}

// 启动测试服务器
function startTestServer() {
  console.log('\n=== 启动测试服务器 ===');
  console.log('启动不依赖数据库的测试服务器...');
  
  const testServer = exec('node test-server.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`执行错误: ${error.message}`);
      return;
    }
  });
  
  testServer.stdout.on('data', (data) => {
    console.log(data);
  });
  
  testServer.stderr.on('data', (data) => {
    console.error(data);
  });
  
  console.log('测试服务器已启动，按 Ctrl+C 停止服务器');
  console.log('服务器运行在 http://localhost:3000');
}

// 启动完整应用
function startFullApp() {
  console.log('\n=== 启动完整应用 ===');
  console.log('注意: 启动完整应用前，请确保数据库已正确设置');
  
  rl.question('是否继续? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      console.log('编译并启动应用...');
      
      const buildProcess = exec('npm run build', (error, stdout, stderr) => {
        if (error) {
          console.error(`编译错误: ${error.message}`);
          showMainMenu();
          return;
        }
        
        console.log('编译完成，启动应用...');
        
        const startProcess = exec('npm run start:prod', (error, stdout, stderr) => {
          if (error) {
            console.error(`启动错误: ${error.message}`);
            return;
          }
        });
        
        startProcess.stdout.on('data', (data) => {
          console.log(data);
        });
        
        startProcess.stderr.on('data', (data) => {
          console.error(data);
        });
      });
      
      buildProcess.stdout.on('data', (data) => {
        console.log(data);
      });
      
      buildProcess.stderr.on('data', (data) => {
        console.error(data);
      });
    } else {
      showMainMenu();
    }
  });
}

// 启动主菜单
showMainMenu();
