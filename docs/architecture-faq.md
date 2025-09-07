# Edu3 Platform 架构设计 FAQ

本文档收集了在开发 Edu3 Web3 教育平台过程中遇到的关键架构问题和解答。

## 目录
- [权限管理](#权限管理)
- [数据存储策略](#数据存储策略)
- [交易验证流程](#交易验证流程)
- [查询策略选择](#查询策略选择)

---

## 权限管理

### Q1: 谁可以创建课程？

**A:** 只有经过认证的讲师才能创建课程。

#### 讲师认证流程：
1. **申请阶段**：任何用户都可以调用 `applyToBeInstructor()` 申请成为讲师
2. **审核阶段**：只有合约 owner 可以调用 `approveInstructor(address)` 批准申请
3. **创建课程**：通过认证的讲师调用 `createCourse(uint256 price)` 创建课程

#### 权限验证：
```solidity
function createCourse(uint256 price) external returns (uint256) {
    require(isInstructor[msg.sender], "Only instructors can create courses");
    require(price > 0, "Price must be greater than 0");
    // ... 创建逻辑
}
```

### Q2: 合约 Owner 能否直接创建课程？

**A:** 不能！Owner ≠ Instructor

- **Owner 权限**：管理合约、批准讲师申请、设置手续费
- **Instructor 权限**：创建课程、管理自己的课程

如果 Owner 想创建课程，需要：
1. 调用 `applyToBeInstructor()`
2. 调用 `approveInstructor(owner_address)` 批准自己
3. 现在可以调用 `createCourse(price)` 了

#### 当前部署信息：
- **合约 Owner**: `0xd0d30720cb6741e00d743073cb1794bbdd9da345`
- **网络**: Sepolia Testnet
- **合约地址**: `0xD3Ff74DD494471f55B204CB084837D1a7f184092`

---

## 交易验证流程

### Q3: 申请讲师时需要预先 approve 代币吗？

**A:** 不需要！这里容易混淆概念。

#### 不同操作的验证需求：

| 操作 | 是否需要 approve | 原因 |
|------|----------------|------|
| **申请讲师** | ❌ 不需要 | 只是标记状态，不涉及代币转账 |
| **创建课程** | ❌ 不需要 | 只是创建记录，不涉及代币转账 |
| **购买课程** | ✅ **必须** | 需要转账 YD 代币给讲师和平台 |

#### 购买课程的完整流程：
```javascript
// 1. 首先 approve 课程平台使用你的 YD 代币
await ydTokenContract.approve(coursePlatformAddress, coursePrice)

// 2. 然后购买课程（会触发代币转账）
await coursePlatformContract.buyCourse(courseId)
```

### Q4: 申请讲师的完整流程是什么？

**A:** 纯链上操作，不需要调用 API

#### 完整流程：
1. **前端操作**：用户点击"申请讲师"按钮
2. **钱包授权**：调起钱包确认交易
3. **链上写入**：调用 `applyToBeInstructor()` 写入区块链
4. **状态更新**：`instructorApplications[msg.sender] = true`
5. **等待批准**：管理员调用 `approveInstructor(address)`
6. **权限获得**：`isInstructor[address] = true`

#### 前端实现：
```typescript
// 申请讲师（纯链上操作）
const handleApplyForInstructor = async () => {
  await writeContract({
    address: CONTRACTS.COURSE_PLATFORM.address,
    abi: CONTRACTS.COURSE_PLATFORM.abi,
    functionName: 'applyToBeInstructor', // 只写区块链，不调用API
  })
}

// 检查讲师状态（读取链上数据）
const { data: isInstructor } = useReadContract({
  functionName: 'isInstructor',
  args: [address],
})
```

---

## 数据存储策略

### Q5: 什么时候使用数据库、The Graph、直接调用合约？

**A:** 根据数据特性和查询需求选择不同存储方案。

#### 三种存储方式对比：

| 存储方式 | 适用场景 | 优点 | 缺点 |
|---------|----------|------|------|
| **🔗 智能合约** | 实时查询核心权限和状态 | 最权威、最新 | 查询慢、Gas费用 |
| **🔍 The Graph** | 复杂查询、历史数据、统计 | 查询快、功能强大 | 可能有延迟 |
| **💾 API+数据库** | 业务逻辑、用户体验 | 最快、最灵活 | 中心化、可能不同步 |

#### 数据存储分工：

| 数据类型 | 存储位置 | 原因 |
|---------|----------|------|
| 讲师申请状态 | 🔗 区块链 | 去中心化权限管理 |
| 讲师认证状态 | 🔗 区块链 | 核心权限数据 |
| 课程基本信息 | 🔗 区块链 | 价格、作者等核心数据 |
| 课程详细内容 | 💾 数据库 | 标题、描述、图片等 |
| 用户购买记录 | 🔗 区块链 + 💾 数据库 | 双重记录 |
| 用户资料 | 💾 数据库 | 用户体验数据 |
| 统计分析 | 🔍 The Graph | 复杂查询需求 |

---

## 查询策略选择

### Q6: 不同页面应该使用哪种查询方式？

**A:** 混合查询策略，优先保证用户体验。

#### 典型应用场景：

### 1. **课程列表页面**
```typescript
// 优先使用 API（快速响应）
const { data: courses } = useQuery('courses', () => 
  fetch('/api/courses').then(r => r.json())
)

// 备用 The Graph（数据分析）
const { data: coursesFromGraph } = useQuery('courses-graph', () =>
  graphqlClient.request(GET_COURSES_QUERY)
)
```

### 2. **课程详情页面**
```typescript
// 1. 从 API 获取详细信息（快）
const courseDetails = await fetch(`/api/courses/${courseId}`)

// 2. 从合约验证核心数据（权威）
const onChainPrice = await contract.getCourse(courseId)

// 3. 检查购买状态（实时）
const hasPurchased = await contract.hasPurchasedCourse(courseId, userAddress)
```

### 3. **讲师仪表板**
```typescript
// 1. 检查讲师身份（合约 - 权威）
const isInstructor = await contract.isInstructor(address)

// 2. 获取课程统计（The Graph - 强大查询）
const stats = await graphqlClient.request(`
  query InstructorStats($instructor: String!) {
    courses(where: { instructor: $instructor }) {
      totalSales
      studentCount
    }
  }
`)

// 3. 获取详细课程管理（API - 快速CRUD）
const courses = await fetch(`/api/users/courses/created`)
```

#### 混合查询最佳实践：
```typescript
export function useCourseData(courseId: string) {
  // 1. 快速显示基本信息（API）
  const { data: courseInfo } = useQuery(['course', courseId], () =>
    fetch(`/api/courses/${courseId}`).then(r => r.json())
  )
  
  // 2. 验证关键数据（合约）
  const { data: onChainData } = useReadContract({
    functionName: 'getCourse',
    args: [courseId],
  })
  
  // 3. 获取统计数据（The Graph）
  const { data: analytics } = useQuery(['course-analytics', courseId], () =>
    graphqlClient.request(GET_COURSE_ANALYTICS, { courseId })
  )
  
  return {
    courseInfo,    // 详细信息，快速显示
    onChainData,   // 权威数据，验证用
    analytics      // 统计数据，增强体验
  }
}
```

---

## 业务流程实例

### 典型业务流程

#### **创建课程流程：**
1. 用户在前端填写课程信息
2. **调用合约** `createCourse()` → 写入链上基本信息
3. **调用 API** `POST /api/courses` → 存储详细信息到数据库  
4. **The Graph** 自动索引链上事件（几分钟后可查询）

#### **购买课程流程：**
1. **调用合约** `approve()` → 授权平台使用代币
2. **调用合约** `buyCourse()` → 转账并记录购买
3. **调用 API** `POST /api/courses/:id/enroll` → 记录购买到数据库
4. **前端查询合约** 验证购买状态（实时）

#### **课程列表展示：**
1. **优先使用 API** → 快速响应，完整信息
2. **备用 The Graph** → 如果 API 不可用  
3. **不直接查合约** → 太慢，用户体验差

---

## 设计原则

### 数据一致性策略
- **权威数据源**：智能合约是权威数据源
- **性能优化**：API 和 The Graph 作为缓存和增强
- **用户体验**：优先使用快速查询，关键时刻验证权威数据
- **容错设计**：多种查询方式互为备份

### 安全考虑
- **权限验证**：关键权限只存储在合约中
- **数据验证**：重要操作前验证链上数据
- **去中心化**：核心功能不依赖中心化服务

---

*最后更新：2024年12月*