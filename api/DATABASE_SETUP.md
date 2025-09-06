# 数据库设置指南

## 快速开始

### 1. 安装PostgreSQL

#### MacOS (使用 Homebrew)
```bash
brew install postgresql
brew services start postgresql
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Windows
下载并安装：https://www.postgresql.org/download/windows/

### 2. 创建数据库

连接到PostgreSQL并创建数据库：

```bash
# 连接到PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE edu3_platform;

# 创建用户 (可选)
CREATE USER edu3_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE edu3_platform TO edu3_user;

# 退出
\q
```

### 3. 配置环境变量

在 `api/.env` 文件中配置数据库连接：

```env
# 数据库配置
DATABASE_URL="postgresql://postgres:password@localhost:5432/edu3_platform"

# 或者使用专用用户
# DATABASE_URL="postgresql://edu3_user:your_password@localhost:5432/edu3_platform"

# 其他配置
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# 区块链配置
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
YD_TOKEN_ADDRESS=0xcD274B0B4cf04FfB5E6f1E17f8a62239a9564173
COURSE_PLATFORM_ADDRESS=0xD3Ff74DD494471f55B204CB084837D1a7f184092

# CORS配置
CORS_ORIGIN=http://localhost:5173

# 速率限制
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. 安装依赖

```bash
cd api
npm install
# 或
pnpm install
```

### 5. 运行数据库迁移

```bash
# 生成Prisma客户端
npm run db:generate

# 运行数据库迁移
npm run db:migrate

# 填充种子数据
npm run db:seed
```

### 6. 启动开发服务器

```bash
npm run dev
```

## 数据库管理命令

### 基本操作

```bash
# 生成Prisma客户端
npm run db:generate

# 推送模式变更到数据库 (开发环境快速测试)
npm run db:push

# 创建新的迁移
npm run db:migrate

# 重置数据库 (删除所有数据并重新迁移)
npm run db:reset

# 填充种子数据
npm run db:seed

# 打开Prisma Studio (可视化数据库管理工具)
npm run db:studio
```

### 高级操作

```bash
# 创建新迁移(不应用)
npx prisma migrate dev --create-only

# 部署迁移到生产环境
npx prisma migrate deploy

# 查看迁移状态
npx prisma migrate status

# 重置迁移历史
npx prisma migrate reset

# 从现有数据库生成schema
npx prisma db pull
```

## 数据库模式说明

### 核心表

1. **users** - 用户表
   - 存储钱包地址、用户名、邮箱等信息
   - 包含讲师状态标识

2. **courses** - 课程表
   - 课程基本信息、价格、难度等
   - 关联讲师和链上ID

3. **lessons** - 课程章节表
   - 课程内容、视频链接、时长等
   - 支持预览章节设置

4. **enrollments** - 课程注册表
   - 记录用户购买课程的交易信息
   - 包含交易哈希和购买价格

5. **progress** - 学习进度表
   - 跟踪用户学习进度
   - 记录观看时间和完成状态

6. **reviews** - 课程评价表
   - 用户对课程的评分和评论

### 关系说明

```
User (1:N) Course         - 用户可以创建多门课程
User (1:N) Enrollment     - 用户可以购买多门课程
Course (1:N) Lesson       - 课程包含多个章节
Course (1:N) Enrollment   - 课程可被多个用户购买
User (1:N) Progress       - 用户有多条学习进度记录
```

## 生产环境部署

### 1. 使用云数据库

推荐使用托管的PostgreSQL服务：

- **AWS RDS**
- **Google Cloud SQL**
- **Azure Database for PostgreSQL**
- **PlanetScale** (MySQL兼容)
- **Supabase**
- **Railway**
- **Render**

### 2. 环境变量设置

生产环境的 `.env` 文件：

```env
NODE_ENV=production
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
JWT_SECRET="production-jwt-secret-very-long-and-random"
SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID"
# ... 其他配置
```

### 3. 部署命令

```bash
# 安装依赖
npm install --production

# 生成Prisma客户端
npm run db:generate

# 运行生产环境迁移
npx prisma migrate deploy

# 启动应用
npm start
```

## 故障排除

### 常见问题

1. **连接错误**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:5432
   ```
   - 检查PostgreSQL是否启动
   - 确认端口和地址正确

2. **权限错误**
   ```
   Error: permission denied for relation
   ```
   - 检查用户权限
   - 确认数据库存在

3. **迁移冲突**
   ```
   Error: Migration failed
   ```
   - 检查迁移历史
   - 可能需要手动解决冲突

### 数据备份

```bash
# 备份数据库
pg_dump -U postgres -h localhost edu3_platform > backup.sql

# 恢复数据库
psql -U postgres -h localhost edu3_platform < backup.sql
```

### 性能优化

1. **添加索引**
   ```sql
   CREATE INDEX idx_courses_category ON courses(category);
   CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
   CREATE INDEX idx_progress_user_course ON progress(user_id, course_id);
   ```

2. **查询优化**
   - 使用 `include` 而非多次查询
   - 合理使用分页
   - 添加适当的WHERE条件

## API路由更新

由于我们现在使用真实数据库，需要更新主路由文件来使用新的数据库版本：

### 更新 index.ts

在 `api/src/index.ts` 中，将课程路由改为使用数据库版本：

```typescript
// 替换这行
import courseRoutes from './routes/courses';

// 为这行
import courseRoutes from './routes/courses-db';
```

## 使用示例

### 1. 创建课程

```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "title": "NFT开发实战",
    "description": "学习如何创建和部署NFT智能合约",
    "price": "100000000000000000",
    "category": "Development",
    "difficulty": "INTERMEDIATE",
    "onChainId": 4,
    "instructorAddress": "0x1234567890123456789012345678901234567890",
    "tags": ["NFT", "ERC721", "OpenSea"],
    "requirements": ["熟悉Solidity基础", "了解ERC标准"],
    "objectives": ["创建NFT合约", "部署到测试网", "集成OpenSea"]
  }'
```

### 2. 查询课程

```bash
# 获取所有课程
curl http://localhost:3000/api/courses

# 按分类过滤
curl "http://localhost:3000/api/courses?category=Development&difficulty=BEGINNER"

# 搜索课程
curl "http://localhost:3000/api/courses?search=Web3&page=1&limit=5"

# 获取特定课程
curl http://localhost:3000/api/courses/{courseId}
```

### 3. 记录购买

```bash
curl -X POST http://localhost:3000/api/courses/{courseId}/enroll \
  -H "Content-Type: application/json" \
  -d '{
    "txHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "userAddress": "0x3456789012345678901234567890123456789012",
    "price": "100000000000000000"
  }'
```

## 监控和日志

### 数据库连接监控

```typescript
// 在 prisma.ts 中添加
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'info', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

// 监听查询事件
prisma.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Duration: ' + e.duration + 'ms');
});
```

### 健康检查端点

```typescript
// 在主路由中添加数据库健康检查
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
    });
  }
});
```

## 下一步

1. **启动PostgreSQL服务**
2. **配置环境变量**
3. **运行数据库迁移**
4. **填充种子数据**
5. **更新路由引用**
6. **测试API功能**

现在你的EDU3平台将使用真实的PostgreSQL数据库，支持完整的CRUD操作、数据持久化和关系查询。
