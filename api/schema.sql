-- EDU3 简化数据库架构
-- 只保留Web3核心功能必需的表

-- 用户表（最小化）
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    address VARCHAR(42) UNIQUE NOT NULL,
    username VARCHAR(50),
    is_instructor BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 课程表（基础信息）
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    chain_id INTEGER UNIQUE NOT NULL, -- 链上课程ID
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(20,0) NOT NULL, -- YD代币价格（wei单位）
    instructor_address VARCHAR(42) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 购买记录表（链上交易验证）
CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    user_address VARCHAR(42) NOT NULL,
    course_chain_id INTEGER NOT NULL,
    tx_hash VARCHAR(66) UNIQUE NOT NULL,
    block_number INTEGER,
    price DECIMAL(20,0) NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_chain_id) REFERENCES courses(chain_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_address ON users(address);
CREATE INDEX IF NOT EXISTS idx_courses_chain_id ON courses(chain_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_address ON purchases(user_address);
CREATE INDEX IF NOT EXISTS idx_purchases_course_chain_id ON purchases(course_chain_id);
CREATE INDEX IF NOT EXISTS idx_purchases_tx_hash ON purchases(tx_hash);

-- 不插入任何示例数据，只保留表结构
