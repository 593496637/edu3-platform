import { gql } from '@apollo/client';

// 🟢 高优先级替换 - YD Token 余额显示 (非交易场景)
export const GET_USER_BALANCE = gql`
  query GetUserBalance($userAddress: String!) {
    userTokenBalance(id: $userAddress) {
      id
      user
      balance
      lastUpdated
    }
  }
`;

// 🟢 高优先级替换 - 用户交易历史
export const GET_USER_TOKEN_TRANSACTIONS = gql`
  query GetUserTokenTransactions($userAddress: String!, $first: Int = 20, $skip: Int = 0) {
    # Token购买记录
    tokenPurchases(
      where: { buyer: $userAddress }
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      buyer
      ethAmount
      tokenAmount
      blockNumber
      blockTimestamp
      transactionHash
    }
    
    # Token出售记录
    tokenSales(
      where: { seller: $userAddress }
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      seller
      tokenAmount
      ethAmount
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// 🟢 高优先级替换 - 课程购买记录查询
export const GET_USER_COURSE_PURCHASES = gql`
  query GetUserCoursePurchases($userAddress: String!) {
    coursePurchaseds(
      where: { student: $userAddress }
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      courseId
      student
      author
      price
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// 检查用户是否购买了特定课程
export const CHECK_COURSE_PURCHASE = gql`
  query CheckCoursePurchase($userAddress: String!, $courseId: String!) {
    coursePurchaseds(
      where: { 
        student: $userAddress, 
        courseId: $courseId 
      }
      first: 1
    ) {
      id
      courseId
      student
      author
      price
      blockTimestamp
      transactionHash
    }
  }
`;

// 🟢 高优先级替换 - 用户所有代币转账记录
export const GET_USER_TOKEN_TRANSFERS = gql`
  query GetUserTokenTransfers($userAddress: String!, $first: Int = 20, $skip: Int = 0) {
    # 接收的转账
    tokenTransfersReceived: tokenTransfers(
      where: { to: $userAddress }
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      from
      to
      value
      blockNumber
      blockTimestamp
      transactionHash
    }
    
    # 发送的转账
    tokenTransfersSent: tokenTransfers(
      where: { from: $userAddress }
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      from
      to
      value
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// 🟢 高优先级替换 - 平台统计数据
export const GET_PLATFORM_STATS = gql`
  query GetPlatformStats {
    # YD Token 信息
    ydtoken: ydtokens(first: 1) {
      id
      name
      symbol
      decimals
      totalSupply
    }
    
    # 交易统计
    tokenPurchases(first: 1000) {
      id
      ethAmount
      tokenAmount
      blockTimestamp
    }
    
    tokenSales(first: 1000) {
      id
      tokenAmount
      ethAmount
      blockTimestamp
    }
    
    # 课程统计
    coursePurchaseds(first: 1000) {
      id
      courseId
      price
      blockTimestamp
    }
    
    courseCreateds(first: 1000) {
      id
      courseId
      author
      price
      blockTimestamp
    }
    
    # 讲师统计
    instructorApproveds {
      id
      instructor
      blockTimestamp
    }
  }
`;

// 🟢 最近平台活动
export const GET_RECENT_ACTIVITY = gql`
  query GetRecentActivity($first: Int = 10) {
    # 最近的Token购买
    recentTokenPurchases: tokenPurchases(
      first: $first
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      buyer
      ethAmount
      tokenAmount
      blockTimestamp
      transactionHash
    }
    
    # 最近的课程购买
    recentCoursePurchases: coursePurchaseds(
      first: $first
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      courseId
      student
      author
      price
      blockTimestamp
      transactionHash
    }
    
    # 最近创建的课程
    recentCourses: courseCreateds(
      first: $first
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      courseId
      author
      price
      blockTimestamp
      transactionHash
    }
  }
`;

// 🟢 讲师统计数据
export const GET_INSTRUCTOR_STATS = gql`
  query GetInstructorStats($instructorAddress: String!) {
    # 讲师创建的课程
    courseCreateds(
      where: { author: $instructorAddress }
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      courseId
      author
      price
      blockTimestamp
      transactionHash
    }
    
    # 讲师课程的销售记录
    coursePurchaseds(
      where: { author: $instructorAddress }
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      courseId
      student
      author
      price
      blockTimestamp
      transactionHash
    }
  }
`;

// 🟢 特定课程的购买统计
export const GET_COURSE_PURCHASES = gql`
  query GetCoursePurchases($courseId: String!) {
    coursePurchaseds(
      where: { courseId: $courseId }
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      courseId
      student
      author
      price
      blockTimestamp
      transactionHash
    }
  }
`;

// 🟢 增强版余额查询 - 包含历史数据用于趋势分析
export const GET_USER_BALANCE_HISTORY = gql`
  query GetUserBalanceHistory($userAddress: String!, $since: String!) {
    # 当前余额
    userTokenBalance(id: $userAddress) {
      id
      user
      balance
      lastUpdated
    }
    
    # 影响余额的所有交易 (since 某个时间点)
    tokenPurchases(
      where: { 
        buyer: $userAddress,
        blockTimestamp_gte: $since 
      }
      orderBy: blockTimestamp
      orderDirection: asc
    ) {
      id
      tokenAmount
      blockTimestamp
    }
    
    tokenSales(
      where: { 
        seller: $userAddress,
        blockTimestamp_gte: $since 
      }
      orderBy: blockTimestamp
      orderDirection: asc
    ) {
      id
      tokenAmount
      blockTimestamp
    }
    
    tokenTransfersReceived: tokenTransfers(
      where: { 
        to: $userAddress,
        blockTimestamp_gte: $since 
      }
      orderBy: blockTimestamp
      orderDirection: asc
    ) {
      id
      value
      blockTimestamp
    }
    
    tokenTransfersSent: tokenTransfers(
      where: { 
        from: $userAddress,
        blockTimestamp_gte: $since 
      }
      orderBy: blockTimestamp
      orderDirection: asc
    ) {
      id
      value
      blockTimestamp
    }
  }
`;

// 🟢 市场概览数据
export const GET_MARKET_OVERVIEW = gql`
  query GetMarketOverview($timeframe: String!) {
    # 指定时间段内的交易活动
    recentPurchases: tokenPurchases(
      where: { blockTimestamp_gte: $timeframe }
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      buyer
      ethAmount
      tokenAmount
      blockTimestamp
    }
    
    recentSales: tokenSales(
      where: { blockTimestamp_gte: $timeframe }
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      seller
      tokenAmount
      ethAmount
      blockTimestamp
    }
    
    # Token 基本信息
    ydtoken: ydtokens(first: 1) {
      id
      totalSupply
    }
  }
`;

// 🟢 分页查询通用片段
export const TRANSACTION_FRAGMENT = gql`
  fragment TransactionDetails on TokenPurchase {
    id
    buyer
    ethAmount
    tokenAmount
    blockNumber
    blockTimestamp
    transactionHash
  }
`;

export const COURSE_PURCHASE_FRAGMENT = gql`
  fragment CoursePurchaseDetails on CoursePurchased {
    id
    courseId
    student
    author
    price
    blockNumber
    blockTimestamp
    transactionHash
  }
`;

// 🟢 实时查询 - 订阅最新活动 (如果 Graph 支持订阅)
export const SUBSCRIBE_TOKEN_ACTIVITIES = gql`
  subscription TokenActivities {
    tokenPurchases(
      orderBy: blockTimestamp
      orderDirection: desc
      first: 5
    ) {
      id
      buyer
      ethAmount
      tokenAmount
      blockTimestamp
    }
    
    tokenSales(
      orderBy: blockTimestamp
      orderDirection: desc
      first: 5
    ) {
      id
      seller
      tokenAmount
      ethAmount
      blockTimestamp
    }
  }
`;

// 📊 分析查询 - 用于仪表板和统计
export const GET_ANALYTICS_DATA = gql`
  query GetAnalyticsData($period: String!) {
    # 指定周期内的统计
    tokenPurchasesByPeriod: tokenPurchases(
      where: { blockTimestamp_gte: $period }
    ) {
      id
      buyer
      ethAmount
      tokenAmount
      blockTimestamp
    }
    
    coursePurchasesByPeriod: coursePurchaseds(
      where: { blockTimestamp_gte: $period }
    ) {
      id
      courseId
      student
      price
      blockTimestamp
    }
    
    uniqueUsers: userTokenBalances {
      id
      user
    }
  }
`;
