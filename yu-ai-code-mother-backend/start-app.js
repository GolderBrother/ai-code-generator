const { exec } = require('child_process');
const fs = require('fs');

// 简单的环境变量解析函数
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const config = {};
  
  content.split('\n').forEach(line => {
    // 忽略注释和空行
    if (line.trim().startsWith('#') || !line.trim()) {
      return;
    }
    
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      config[key] = value;
    }
  });
  
  return config;
}

// 加载环境变量
const envPath = fs.existsSync('.env.local') ? '.env.local' : '.env';
const envConfig = parseEnvFile(envPath);

// 数据库配置
const dbConfig = {
  host: envConfig.DATABASE_HOST || '127.0.0.1',
  port: parseInt(envConfig.DATABASE_PORT || '3306'),
  user: envConfig.DATABASE_USERNAME || 'root',
  password: envConfig.DATABASE_PASSWORD || 'root',
  database: envConfig.DATABASE_NAME || 'yu_ai_code_mother',
};

console.log('数据库连接配置:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database
});

// 由于没有mysql2依赖，我们无法直接检查数据库连接
// 但我们可以提供解决方案
function showDatabaseConnectionHelp() {
  console.log('\n可能的数据库连接问题:');
  console.log('错误: Host \'192.168.65.1\' is not allowed to connect to this MySQL server');
  console.log('\n解决方案:');
  console.log('1. 确保MySQL服务器正在运行');
  console.log('2. 在MySQL中执行以下命令授予权限:');
  console.log(`   CREATE USER 'root'@'192.168.65.1' IDENTIFIED BY 'root';`);
  console.log(`   GRANT ALL PRIVILEGES ON *.* TO 'root'@'192.168.65.1' WITH GRANT OPTION;`);
  console.log(`   FLUSH PRIVILEGES;`);
  console.log('3. 或者修改env.local文件中的DATABASE_HOST为您的MySQL服务器实际IP地址');
  console.log('4. 如果使用Docker，确保容器网络配置正确\n');
}

// 启动应用
function startApp() {
  console.log('正在启动应用...');
  console.log('提示: 如果遇到数据库连接问题，请参考以下解决方案:');
  showDatabaseConnectionHelp();
  
  console.log('\n正在启动测试服务器...');
  const testServerProcess = exec('node test-server.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`执行错误: ${error}`);
      return;
    }
  });
  
  testServerProcess.stdout.on('data', (data) => {
    console.log(data);
  });
  
  testServerProcess.stderr.on('data', (data) => {
    console.error(data);
  });
}

startApp();
