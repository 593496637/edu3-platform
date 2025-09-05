# Web3教育平台 - 简化版本

> 专注于核心Web3钱包交互功能的简化版本

## 🎯 简化目标

本分支将原有的复杂Web3教育平台简化为：
- **3个核心页面**：课程市场、代币兑换、我的课程
- **现代化UI设计**：渐变、动画、玻璃态效果
- **响应式布局**：完美适配移动端和桌面端
- **Web3核心交互**：钱包连接、代币兑换、课程购买

## 🏗️ 技术架构

### 前端技术栈
- **React 19** + TypeScript + Vite
- **TailwindCSS 4** + 自定义动画系统
- **Wagmi + Viem** + RainbowKit (Web3集成)
- **React Query** (状态管理)
- **React Router DOM** (路由)

### 智能合约
- **YDToken.sol** - ERC20代币合约
- **CoursePlatform.sol** - 课程平台核心合约
- **部署网络**: Sepolia测试网

## 📁 项目结构

```
web/src/
├── components/
│   └── Layout.tsx           # 统一布局组件
├── pages/
│   ├── HomePage.tsx         # 课程市场首页
│   ├── ExchangePage.tsx     # 代币兑换页面
│   └── MyCoursesPage.tsx    # 用户课程页面
├── hooks/
│   └── useContracts.ts      # Web3交互Hooks
├── lib/
│   ├── contracts.ts         # 合约配置和ABI
│   └── wagmi.ts            # Wagmi配置
├── App.tsx                  # 主应用组件
└── index.css               # 样式系统
```

## 🚀 快速开始

### 1. 安装依赖
```bash
cd web
pnpm install
```

### 2. 环境配置
```bash
# 复制环境变量文件
cp .env.example .env.local

# 配置API地址
VITE_API_URL=http://localhost:3000/api
```

### 3. 启动开发服务器
```bash
pnpm dev
```

### 4. 钱包配置
- 安装MetaMask钱包
- 切换到Sepolia测试网
- 获取测试ETH: [Sepolia水龙头](https://sepoliafaucet.com/)

## 🎨 界面特色

### 现代化设计元素
- **渐变背景**: 蓝色到紫色的现代渐变
- **玻璃态效果**: 半透明背景和模糊效果
- **流畅动画**: 悬停、点击的过渡动画
- **响应式布局**: 桌面端和移动端完美适配

### Web3交互优化
- **一键连接钱包**: RainbowKit集成
- **实时余额显示**: ETH和YD代币余额
- **交易状态反馈**: 加载动画和成功提示
- **错误处理**: 友好的错误信息展示

## 🔧 核心功能

### 1. 钱包连接
- MetaMask集成
- 多钱包支持(通过RainbowKit)
- 网络切换提示
- 地址显示和断开连接

### 2. 代币兑换
- ETH ↔ YD代币兑换
- 固定汇率: 1 ETH = 4000 YD
- 实时余额显示
- 快速兑换按钮

### 3. 课程市场
- 课程列表展示
- 课程详情预览
- 一键购买课程
- 购买状态跟踪

### 4. 用户中心
- 已购买课程展示
- 学习进度跟踪
- 证书下载功能
- 学习统计数据

## 📱 响应式设计

### 桌面端
- 侧边导航栏
- 大屏幕优化布局
- 悬停动画效果

### 移动端
- 底部导航栏
- 触摸友好的交互
- 优化的卡片布局

## 🎓 学习重点

### Web3核心概念
1. **钱包连接**
   - MetaMask集成
   - 地址管理
   - 网络检测

2. **智能合约交互**
   - 读取合约状态
   - 发送交易
   - 事件监听

3. **代币操作**
   - ERC20代币转账
   - 授权(Approve)机制
   - 余额查询

4. **交易生命周期**
   - 交易签名
   - 交易广播
   - 确认等待

### 前端Web3集成
1. **Wagmi Hooks**
   - `useAccount` - 账户信息
   - `useBalance` - 余额查询
   - `useWriteContract` - 合约写入
   - `useReadContract` - 合约读取

2. **状态管理**
   - 异步状态处理
   - 加载状态管理
   - 错误处理

3. **用户体验**
   - 交易反馈
   - 加载动画
   - 错误提示

## 🔗 相关链接

- [Wagmi 文档](https://wagmi.sh/)
- [RainbowKit 文档](https://www.rainbowkit.com/)
- [Viem 文档](https://viem.sh/)
- [TailwindCSS 文档](https://tailwindcss.com/)
- [Sepolia 测试网](https://sepolia.etherscan.io/)

## 🐛 问题排查

### 常见问题

1. **钱包连接失败**
   - 检查MetaMask是否安装
   - 确认网络是否为Sepolia
   - 刷新页面重试

2. **交易失败**
   - 检查ETH余额是否足够支付Gas
   - 确认代币余额是否充足
   - 查看控制台错误信息

3. **页面加载异常**
   - 检查后端API是否正常运行
   - 确认环境变量配置正确
   - 查看网络请求状态

### 调试工具
- 浏览器开发者工具
- MetaMask交易历史
- Sepolia区块链浏览器

## 📞 技术支持

如果在使用过程中遇到问题：
1. 查看控制台错误信息
2. 检查钱包和网络配置
3. 参考文档和示例代码
4. 提交Issue或联系开发团队

---

**注意**: 这是一个教育项目，仅用于学习Web3开发技术，请勿在主网使用测试代币。

## 🎉 开始体验

1. 克隆项目到本地
2. 切换到 `simplified-version` 分支
3. 按照上述步骤配置和启动
4. 连接钱包开始体验Web3教育平台！