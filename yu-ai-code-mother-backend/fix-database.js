const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// 读取环境变量文件
function loadEnvFile() {
  const envPath = path.join(__dirname, 'env.local');
  const env = {};
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    }
  }
  
  return env;
}

async function fixDatabase() {
  const env = loadEnvFile();
  
  const connection = await mysql.createConnection({
    host: env.DATABASE_HOST || 'localhost',
    port: parseInt(env.DATABASE_PORT) || 3306,
    user: env.DATABASE_USERNAME || 'root',
    password: env.DATABASE_PASSWORD || 'root',
    database: env.DATABASE_NAME || 'yu_ai_code_mother',
  });

  try {
    console.log('开始修复数据库约束问题...');
    console.log(`连接数据库: ${env.DATABASE_HOST || 'localhost'}:${env.DATABASE_PORT || 3306}`);

    // 1. 查看当前的外键约束
    console.log('1. 查看当前的外键约束...');
    const [constraints] = await connection.execute(`
      SELECT 
        CONSTRAINT_NAME,
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM 
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE 
        REFERENCED_TABLE_SCHEMA = ? 
        AND (TABLE_NAME LIKE '%chat%' OR REFERENCED_TABLE_NAME LIKE '%chat%')
    `, [env.DATABASE_NAME || 'yu_ai_code_mother']);
    
    console.log('现有约束:', constraints);

    // 2. 查看相关的索引
    console.log('2. 查看相关的索引...');
    const [indexes] = await connection.execute(`
      SELECT 
        INDEX_NAME,
        TABLE_NAME,
        COLUMN_NAME
      FROM 
        INFORMATION_SCHEMA.STATISTICS 
      WHERE 
        TABLE_SCHEMA = ?
        AND (TABLE_NAME LIKE '%chat%' OR INDEX_NAME LIKE '%chat%')
    `, [env.DATABASE_NAME || 'yu_ai_code_mother']);
    
    console.log('现有索引:', indexes);

    // 3. 检查是否存在旧的chat表
    console.log('3. 检查是否存在旧的chat表...');
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'chat'
    `, [env.DATABASE_NAME || 'yu_ai_code_mother']);

    if (tables.length > 0) {
      console.log('发现旧的chat表，准备删除...');
      
      // 删除指向chat表的外键约束
      for (const constraint of constraints) {
        if (constraint.REFERENCED_TABLE_NAME === 'chat') {
          console.log(`删除外键约束: ${constraint.CONSTRAINT_NAME}`);
          try {
            await connection.execute(`
              ALTER TABLE ${constraint.TABLE_NAME} 
              DROP FOREIGN KEY ${constraint.CONSTRAINT_NAME}
            `);
          } catch (error) {
            console.log(`删除约束失败: ${error.message}`);
          }
        }
      }
      
      // 删除旧的chat表
      await connection.execute('DROP TABLE IF EXISTS chat');
      console.log('旧的chat表已删除');
    }

    // 4. 确保chat_history表存在且结构正确
    console.log('4. 确保chat_history表存在且结构正确...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS chat_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        app_id INT NOT NULL,
        user_id INT NOT NULL,
        message_content TEXT NOT NULL,
        message_type INT DEFAULT 0,
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_delete TINYINT DEFAULT 0,
        INDEX idx_app_id (app_id),
        INDEX idx_user_id (user_id),
        INDEX idx_create_time (create_time)
      )
    `);

    // 5. 检查app和user表是否存在
    console.log('5. 检查app和user表是否存在...');
    const [appTable] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'app'
    `, [env.DATABASE_NAME || 'yu_ai_code_mother']);

    const [userTable] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'user'
    `, [env.DATABASE_NAME || 'yu_ai_code_mother']);

    // 6. 添加正确的外键约束（如果相关表存在）
    console.log('6. 添加正确的外键约束...');
    
    if (appTable.length > 0) {
      try {
        await connection.execute(`
          ALTER TABLE chat_history 
          ADD CONSTRAINT FK_chat_history_app 
          FOREIGN KEY (app_id) REFERENCES app(id) ON DELETE CASCADE
        `);
        console.log('添加app外键约束成功');
      } catch (error) {
        if (!error.message.includes('Duplicate key name') && !error.message.includes('already exists')) {
          console.log(`添加app外键约束失败: ${error.message}`);
        } else {
          console.log('app外键约束已存在');
        }
      }
    } else {
      console.log('app表不存在，跳过添加外键约束');
    }

    if (userTable.length > 0) {
      try {
        await connection.execute(`
          ALTER TABLE chat_history 
          ADD CONSTRAINT FK_chat_history_user 
          FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
        `);
        console.log('添加user外键约束成功');
      } catch (error) {
        if (!error.message.includes('Duplicate key name') && !error.message.includes('already exists')) {
          console.log(`添加user外键约束失败: ${error.message}`);
        } else {
          console.log('user外键约束已存在');
        }
      }
    } else {
      console.log('user表不存在，跳过添加外键约束');
    }

    console.log('数据库修复完成！');

  } catch (error) {
    console.error('修复数据库时出错:', error);
  } finally {
    await connection.end();
  }
}

// 运行修复脚本
fixDatabase().catch(console.error);