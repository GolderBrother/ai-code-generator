-- 修复数据库外键约束问题的SQL脚本
-- 执行前请备份数据库！

USE yu_ai_code_mother;

-- 1. 查看当前的外键约束
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE 
    REFERENCED_TABLE_SCHEMA = 'yu_ai_code_mother'
    AND (TABLE_NAME LIKE '%chat%' OR REFERENCED_TABLE_NAME LIKE '%chat%');

-- 2. 查看相关的索引
SELECT 
    INDEX_NAME,
    TABLE_NAME,
    COLUMN_NAME
FROM 
    INFORMATION_SCHEMA.STATISTICS 
WHERE 
    TABLE_SCHEMA = 'yu_ai_code_mother'
    AND (TABLE_NAME LIKE '%chat%' OR INDEX_NAME LIKE '%chat%');

-- 3. 如果存在旧的chat表，先删除外键约束
-- 注意：请根据实际的约束名称修改以下语句

-- 删除app表中指向chat_history的外键（如果存在）
-- ALTER TABLE app DROP FOREIGN KEY FK_app_chat_history;

-- 删除user表中指向chat_history的外键（如果存在）  
-- ALTER TABLE user DROP FOREIGN KEY FK_user_chat_history;

-- 4. 删除可能存在的旧chat表
-- DROP TABLE IF EXISTS chat;

-- 5. 确保chat_history表存在且结构正确
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
);

-- 6. 添加正确的外键约束
ALTER TABLE chat_history 
ADD CONSTRAINT FK_chat_history_app 
FOREIGN KEY (app_id) REFERENCES app(id) ON DELETE CASCADE;

ALTER TABLE chat_history 
ADD CONSTRAINT FK_chat_history_user 
FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE;

-- 7. 验证表结构
DESCRIBE chat_history;
SHOW CREATE TABLE chat_history;