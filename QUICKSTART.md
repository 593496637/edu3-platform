# EDU3 平台快速启动指南

## 🚀 简化版本 - 快速启动

### 前置条件
- Node.js 18+
- Docker (用于数据库)
- MetaMask 或支持的Web3钱包

### 1. 启动后端API

```bash
# 克隆仓库
git clone <your-repo-url>
cd edu3-platform

# 启动数据库
cd api
docker-compose up -d

# 使用简化版配置
cp package-simple.json package.json
cp .env-simple .env

# 编辑 .env 文件，填入你的配置
# 特别是 SEPOLIA_RPC_URL，建议使用 Infura 或 Alchemy

# 安装依赖并启动
npm install
npm run dev
```

### 2. 启动前端

```bash
# 新开终端窗口
cd web

# 复制环境变量文件
cp .env.example .env.local

# 安装依赖并启动
npm install
npm run dev
```

### 3. 验证运行

- 后端API: http://localhost:3001/health
- 前端界面: http://localhost:5173
- 数据库: PostgreSQL 运行在 localhost:5432

## 🎯 核心功能测试

### 1. 钱包连接
- 打开 http://localhost:5173
- 点击"连接钱包"
- 使用MetaMask连接Sepolia测试网

### 2. 获取测试代币
```bash
# 方法1: 使用内置兑换功能
# 在前端点击"兑换代币"，用测试ETH购买YD代币

# 方法2: 直接调用合约
# 通过Etherscan或Remix直接调用 YDToken.buyTokens() 函数
```

### 3. 测试课程购买流程
1. 申请成为讲师 (如果需要)
2. 创建课程 (讲师功能)
3. 购买课程 (学生功能)
4. 验证购买记录

## 📡 API端点测试

```bash
# 健康检查
curl http://localhost:3001/health

# 获取课程列表
curl http://localhost:3001/api/courses

# 查询代币余额
curl http://localhost:3001/api/blockchain/balance/0x1234567890123456789012345678901234567890

# 检查购买状态
curl http://localhost:3001/api/blockchain/purchased/1/0x1234567890123456789012345678901234567890
```

## 🔧 常见问题解决

### 数据库连接失败
```bash
# 检查Docker容器状态
docker-compose ps

# 重启数据库
docker-compose down
docker-compose up -d

# 查看日志
docker-compose logs postgres
```

### RPC连接失败
1. 检查 `SEPOLIA_RPC_URL` 是否正确
2. 确认Infura/Alchemy项目ID有效
3. 检查网络连接

### 合约交互失败
1. 确认连接的是Sepolia测试网
2. 检查合约地址是否正确
3. 确保钱包有足够的测试ETH支付Gas费

### 前端API请求失败
1. 检查后端API是否正常运行
2. 确认CORS配置正确
3. 查看浏览器控制台错误信息

## 🌐 部署配置

### 环境变量说明

**后端 (.env)**
```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=edu3_db
DB_USER=edu3_user
DB_PASSWORD=edu3_password

# 区块链配置
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
YD_TOKEN_ADDRESS=0xcD274B0B4cf04FfB5E6f1E17f8a62239a9564173
COURSE_PLATFORM_ADDRESS=0xD3Ff74DD494471f55B204CB084837D1a7f184092

# 安全配置
JWT_SECRET=your-super-secret-key
CORS_ORIGIN=http://localhost:5173
```

**前端 (.env.local)**
```bash
# API配置
VITE_API_URL=http://localhost:3001/api

# 应用配置
VITE_APP_NAME=EDU3 Platform
VITE_WALLETCONNECT_PROJECT_ID=your-project-id
```

## 📊 功能验证清单

- [ ] 钱包连接成功
- [ ] 余额查询正常
- [ ] 申请讲师功能
- [ ] 创建课程功能
- [ ] 课程列表显示
- [ ] 购买课程流程
- [ ] 交易验证记录
- [ ] 购买状态检查

## 🔗 相关链接

- **合约地址**
  - YD Token: `0xcD274B0B4cf04FfB5E6f1E17f8a62239a9564173`
  - Course Platform: `0xD3Ff74DD494471f55B204CB084837D1a7f184092`

- **区块浏览器**
  - [Sepolia Etherscan](https://sepolia.etherscan.io/)

- **测试水龙头**
  - [Sepolia Faucet](https://sepoliafaucet.com/)

## 🎉 下一步

成功启动后，你可以：

1. **测试完整流程** - 从申请讲师到购买课程
2. **定制界面** - 修改样式和用户体验
3. **扩展功能** - 添加更多Web3功能
4. **部署上线** - 部署到生产环境

## 💡 开发建议

1. **专注Web3核心** - 简化版已去除复杂功能
2. **逐步扩展** - 可以基于简化版逐步添加功能
3. **测试充分** - 在测试网充分测试后再考虑主网
4. **安全第一** - 注意私钥管理和合约安全

需要帮助？查看代码中的注释或提交Issue！
