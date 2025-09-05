# EDU3 API Documentation

EDU3 Web3教育平台后端API文档

## 基础信息

- **基础URL**: `http://localhost:3000/api`
- **认证方式**: JWT Bearer Token
- **内容类型**: `application/json`

## 认证相关

### 钱包登录
```http
POST /auth/wallet
```

请求体:
```json
{
  "address": "0x1234567890123456789012345678901234567890",
  "message": "验证钱包地址: 0x1234567890123456789012345678901234567890\n时间戳: 1641024000000",
  "signature": "0xabcdef..."
}
```

响应:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "address": "0x1234567890123456789012345678901234567890",
      "username": null,
      "isInstructor": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt-token"
  }
}
```

### 获取用户资料
```http
GET /auth/profile/:address
```

## 课程相关

### 获取课程列表
```http
GET /courses?page=1&limit=10&category=Development&difficulty=BEGINNER&search=Web3
```

响应:
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "uuid",
        "onChainId": 1,
        "title": "Web3开发基础",
        "description": "学习区块链和智能合约开发的基础知识",
        "price": "100",
        "thumbnail": "https://example.com/thumb.jpg",
        "duration": "20小时",
        "difficulty": "BEGINNER",
        "category": "Development",
        "tags": ["Web3", "Blockchain"],
        "instructor": {
          "address": "0x1234...",
          "username": "Alice_Web3"
        },
        "enrollmentCount": 50,
        "reviewCount": 12,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

### 获取课程详情
```http
GET /courses/:id
```

### 创建课程 (需要讲师权限)
```http
POST /courses
Authorization: Bearer jwt-token
```

请求体:
```json
{
  "onChainId": 1,
  "title": "Web3开发基础",
  "description": "学习区块链和智能合约开发的基础知识",
  "content": "详细的课程内容...",
  "price": "100",
  "duration": "20小时",
  "difficulty": "BEGINNER",
  "category": "Development",
  "tags": ["Web3", "Blockchain"],
  "requirements": ["具备基本编程经验"],
  "objectives": ["掌握智能合约开发"]
}
```

### 添加课程章节
```http
POST /courses/:id/lessons
Authorization: Bearer jwt-token
```

### 记录课程购买
```http
POST /courses/:id/enroll
Authorization: Bearer jwt-token
```

请求体:
```json
{
  "txHash": "0xabc123...",
  "price": "100"
}
```

### 检查课程访问权限
```http
GET /courses/:id/access/:address
```

## 用户相关

### 获取个人资料
```http
GET /users/profile
Authorization: Bearer jwt-token
```

### 更新个人资料
```http
PUT /users/profile
Authorization: Bearer jwt-token
```

请求体:
```json
{
  "username": "Alice_Web3",
  "email": "alice@example.com",
  "bio": "区块链开发者",
  "avatar": "https://example.com/avatar.jpg"
}
```

### 申请成为讲师
```http
POST /users/instructor/apply
Authorization: Bearer jwt-token
```

### 获取讲师申请状态
```http
GET /users/instructor/application
Authorization: Bearer jwt-token
```

### 获取已购买课程
```http
GET /users/courses/enrolled?page=1&limit=10
Authorization: Bearer jwt-token
```

### 获取创建的课程
```http
GET /users/courses/created?page=1&limit=10
Authorization: Bearer jwt-token
```

### 更新学习进度
```http
POST /users/progress
Authorization: Bearer jwt-token
```

请求体:
```json
{
  "courseId": "uuid",
  "lessonId": "uuid", 
  "completed": true,
  "watchTime": 3600
}
```

### 获取课程学习进度
```http
GET /users/progress/:courseId
Authorization: Bearer jwt-token
```

## 区块链相关

### 获取代币余额
```http
GET /blockchain/balance/:address
```

响应:
```json
{
  "success": true,
  "data": {
    "address": "0x1234...",
    "balance": "1000000000000000000000",
    "balanceFormatted": "1000.0"
  }
}
```

### 检查讲师状态
```http
GET /blockchain/instructor/:address
```

### 获取课程总数
```http
GET /blockchain/courses/total
```

### 获取链上课程信息
```http
GET /blockchain/courses/:courseId
```

### 检查课程购买状态
```http
GET /blockchain/courses/:courseId/purchased/:address
```

### 获取交易详情
```http
GET /blockchain/transaction/:txHash
```

### 获取Gas价格
```http
GET /blockchain/gas-price
```

### 获取网络信息
```http
GET /blockchain/network
```

### 验证购买交易
```http
POST /blockchain/validate-purchase
```

请求体:
```json
{
  "txHash": "0xabc123...",
  "courseId": 1,
  "userAddress": "0x1234..."
}
```

## 错误处理

API使用标准HTTP状态码，错误响应格式:

```json
{
  "success": false,
  "message": "错误描述",
  "stack": "错误堆栈(仅开发环境)"
}
```

常见状态码:
- `200` - 成功
- `201` - 创建成功 
- `400` - 请求参数错误
- `401` - 未认证
- `403` - 权限不足
- `404` - 资源未找到
- `409` - 资源冲突
- `500` - 服务器内部错误

## 限流

API实施了速率限制:
- 每个IP每15分钟最多100个请求
- 超过限制将返回429状态码

## 环境变量

开发环境需要配置以下环境变量:

```bash
# 数据库
DATABASE_URL="postgresql://username:password@localhost:5432/edu3_db"

# 服务器
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# 区块链
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-project-id
PRIVATE_KEY=your-private-key
YD_TOKEN_ADDRESS=0xcD274B0B4cf04FfB5E6f1E17f8a62239a9564173
COURSE_PLATFORM_ADDRESS=0xD3Ff74DD494471f55B204CB084837D1a7f184092

# CORS
CORS_ORIGIN=http://localhost:5173
```

## 部署指南

### 1. 安装依赖
```bash
cd api
npm install
```

### 2. 设置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填入实际配置
```

### 3. 数据库迁移
```bash
npx prisma migrate dev
npx prisma generate
```

### 4. 数据初始化
```bash
npm run db:seed
```

### 5. 启动开发服务器
```bash
npm run dev
```

### 6. 构建生产版本
```bash
npm run build
npm start
```

## 开发指南

### 项目结构
```
api/
├── src/
│   ├── lib/          # 工具库
│   ├── middleware/   # 中间件
│   ├── routes/       # 路由定义
│   ├── scripts/      # 脚本文件
│   └── index.ts      # 入口文件
├── prisma/
│   └── schema.prisma # 数据库模型
├── package.json
└── tsconfig.json
```

### 添加新路由

1. 在 `src/routes/` 目录下创建新的路由文件
2. 使用 `asyncHandler` 包装异步路由处理器
3. 使用 `express-validator` 进行参数验证
4. 在 `src/index.ts` 中注册新路由

### 数据库操作

使用Prisma进行数据库操作:

```typescript
import { prisma } from '../lib/prisma';

// 查询
const users = await prisma.user.findMany();

// 创建
const user = await prisma.user.create({
  data: { address: '0x123...', username: 'Alice' }
});

// 更新
const updatedUser = await prisma.user.update({
  where: { id: userId },
  data: { username: 'Bob' }
});
```

### 区块链交互

使用ethers.js与智能合约交互:

```typescript
import { getCoursePlatformContract } from '../lib/blockchain';

const contract = getCoursePlatformContract();
const totalCourses = await contract.getTotalCourses();
```

## 测试

### API测试示例

使用curl测试API:

```bash
# 健康检查
curl http://localhost:3000/health

# 获取课程列表
curl http://localhost:3000/api/courses

# 钱包登录
curl -X POST http://localhost:3000/api/auth/wallet \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x1234567890123456789012345678901234567890",
    "message": "验证钱包地址: 0x1234567890123456789012345678901234567890\n时间戳: 1641024000000",
    "signature": "0xabcdef..."
  }'
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 `DATABASE_URL` 环境变量
   - 确保PostgreSQL服务正在运行

2. **区块链连接失败**
   - 检查 `SEPOLIA_RPC_URL` 是否正确
   - 验证网络连接

3. **JWT验证失败**
   - 检查 `JWT_SECRET` 环境变量
   - 确保前端发送正确的Authorization头

4. **CORS错误**
   - 检查 `CORS_ORIGIN` 配置
   - 确保前端域名在允许列表中

### 日志查看

开发环境下，API会输出详细的请求日志和错误信息。生产环境建议使用专业的日志管理工具。

## 安全注意事项

1. **私钥管理**: 生产环境使用安全的私钥管理方案
2. **JWT密钥**: 使用强随机密钥，定期轮换
3. **HTTPS**: 生产环境必须使用HTTPS
4. **输入验证**: 严格验证所有用户输入
5. **权限控制**: 实施细粒度的权限控制
6. **日志审计**: 记录关键操作的审计日志
