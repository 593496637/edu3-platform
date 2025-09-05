# EDU3 API Documentation

EDU3 Web3教育平台后端API文档

## 基础信息

- **基础URL**: `http://localhost:3001/api`
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
PORT=3001
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

### 本地开发

1. 安装依赖:
```bash
cd api
npm install
```

2. 配置环境变量:
```bash
cp .env.example .env
# 编辑 .env 文件配置数据库和其他参数
```

3. 设置数据库:
```bash
npm run db:migrate
npm run db:generate
npm run db:seed
```

4. 启动开发服务器:
```bash
npm run dev
```

### 生产部署

1. 构建项目:
```bash
npm run build
```

2. 启动生产服务器:
```bash
npm start
```

## 开发说明

### 数据库迁移

创建新的迁移:
```bash
npx prisma migrate dev --name migration_name
```

重置数据库:
```bash
npx prisma migrate reset
```

### 代码结构

```
src/
├── index.ts              # 应用入口
├── lib/
│   ├── prisma.ts         # 数据库连接
│   └── blockchain.ts     # 区块链交互
├── middleware/
│   ├── auth.ts           # 认证中间件
│   ├── errorHandler.ts   # 错误处理
│   └── requestLogger.ts  # 请求日志
├── routes/
│   ├── auth.ts           # 认证路由
│   ├── courses.ts        # 课程路由
│   ├── users.ts          # 用户路由
│   └── blockchain.ts     # 区块链路由
└── scripts/
    └── seed.ts           # 数据库种子数据
```

### API设计原则

1. **RESTful设计**: 遵循REST API设计规范
2. **统一响应格式**: 所有API响应使用统一的JSON格式
3. **错误处理**: 统一的错误处理和状态码
4. **认证授权**: 基于JWT的认证和基于角色的授权
5. **输入验证**: 使用express-validator进行输入验证
6. **安全性**: 使用helmet、cors、rate-limiting等安全中间件

### 测试

建议使用Postman或类似工具测试API端点。可以导入以下环境变量:

```json
{
  "name": "EDU3 API",
  "values": [
    {
      "key": "base_url",
      "value": "http://localhost:3001/api"
    },
    {
      "key": "token",
      "value": "your-jwt-token"
    }
  ]
}
```

### 监控和日志

- 所有HTTP请求都会被记录到控制台
- 错误日志包含详细的堆栈信息（仅开发环境）
- 可以集成Winston或其他日志库进行更高级的日志管理

### 性能优化

- 使用Prisma连接池管理数据库连接
- 实施API速率限制
- 对频繁查询的数据考虑添加缓存
- 使用分页避免大量数据查询

### 安全考虑

- JWT token有过期时间
- 钱包签名验证防止伪造身份
- 输入验证防止SQL注入
- CORS配置限制跨域访问
- 使用Helmet增强HTTP安全头
