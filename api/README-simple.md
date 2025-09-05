# EDU3 简化版 - 快速启动指南

## 🎯 核心功能

这是EDU3项目的简化版，专注于Web3核心功能：

1. **钱包连接和签名验证**
2. **课程购买和链上验证**
3. **代币余额查询**
4. **基础课程展示**

## 🚀 快速启动

### 1. 启动数据库
```bash
cd api
docker-compose up -d
```

### 2. 设置环境变量
```bash
cp .env-simple .env
# 编辑 .env 文件，填入你的RPC_URL等配置
```

### 3. 安装依赖并启动
```bash
# 使用简化版package.json
cp package-simple.json package.json
npm install

# 构建并启动
npm run build
npm start

# 或开发模式
npm run dev
```

## 📡 API端点

### 认证
- `POST /api/auth/login` - 钱包签名登录

### 课程
- `GET /api/courses` - 获取课程列表

### 区块链查询
- `GET /api/blockchain/balance/:address` - 查询YD代币余额
- `GET /api/blockchain/purchased/:courseId/:address` - 检查购买状态
- `GET /api/blockchain/instructor/:address` - 检查讲师状态

### 购买验证
- `POST /api/purchases/verify` - 验证并记录购买交易
- `GET /api/users/:address/purchases` - 获取用户购买记录

## 📝 使用示例

### 1. 钱包登录
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x1234567890123456789012345678901234567890",
    "message": "验证钱包地址: 0x1234567890123456789012345678901234567890\n时间戳: 1641024000000",
    "signature": "0xabcdef..."
  }'
```

### 2. 查询代币余额
```bash
curl http://localhost:3000/api/blockchain/balance/0x1234567890123456789012345678901234567890
```

### 3. 验证购买交易
```bash
curl -X POST http://localhost:3000/api/purchases/verify \
  -H "Content-Type: application/json" \
  -d '{
    "txHash": "0xabc123...",
    "courseId": 1,
    "userAddress": "0x1234..."
  }'
```

## 🗄️ 数据库结构

简化的3张表结构：
- `users` - 用户基本信息
- `courses` - 课程基本信息
- `purchases` - 购买记录和交易验证

## 🎨 前端集成

前端可以直接调用这些API：

```typescript
// 钱包登录
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ address, message, signature })
});

// 查询余额
const balanceResponse = await fetch(`/api/blockchain/balance/${address}`);

// 验证购买
const verifyResponse = await fetch('/api/purchases/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ txHash, courseId, userAddress })
});
```

## 🔧 与原版对比

**简化掉的功能：**
- Prisma ORM -> 原生SQL
- 复杂的用户系统 -> 基础钱包认证
- 详细的课程管理 -> 基础展示
- 学习进度跟踪 -> 专注购买验证
- 文件上传 -> 去除
- 复杂的权限系统 -> 简化

**保留的核心：**
- 钱包签名验证 ✅
- 链上数据查询 ✅
- 购买交易验证 ✅
- 基础课程展示 ✅

## 🎯 适用场景

这个简化版本适合：
- 快速原型验证
- Web3功能演示
- 学习区块链集成
- 基础MVP开发

如果需要完整的教育平台功能，建议使用完整版本。
