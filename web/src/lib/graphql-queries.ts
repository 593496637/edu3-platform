import { gql } from '@apollo/client';

// 用户余额查询
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

// 用户代币交易历史
export const GET_USER_TOKEN_TRANSACTIONS = gql`
  query GetUserTokenTransactions($userAddress: String!, $first: Int = 20, $skip: Int = 0) {
    # 代币购买记录
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
    
    # 代币出售记录
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

// 用户课程购买记录
export const GET_USER_COURSE_PURCHASES = gql`
  query GetUserCoursePurchases($userAddress: String!, $first: Int = 50) {
    coursePurchaseds(
      where: { student: $userAddress }
      first: $first
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      courseId
      student
      instructor
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
      blockTimestamp
      transactionHash
    }
  }
`;

// 所有代币转账记录
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

// 平台统计数据
export const GET_PLATFORM_STATS = gql`
  query GetPlatformStats {
    # YD Token 信息
    ydtoken(id: "0xcd274b0b4cf04ffb5e6f1e17f8a62239a9564173") {
      id
      name
      symbol
      decimals
      totalSupply
    }
    
    # 总交易统计
    tokenPurchases(first: 1000) {
      id
      ethAmount
      tokenAmount
    }
    
    tokenSales(first: 1000) {
      id
      ethAmount
      tokenAmount
    }
    
    # 课程购买统计
    coursePurchaseds(first: 1000) {
      id
      price
    }
    
    # 讲师统计
    instructorApproveds {
      id
      instructor
    }
  }
`;

// 最近的平台活动
export const GET_RECENT_ACTIVITY = gql`
  query GetRecentActivity($first: Int = 10) {
    # 最近的代币购买
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
      instructor
      price
      blockTimestamp
      transactionHash
    }
    
    # 最近的课程创建
    recentCourses: courseCreateds(
      first: $first
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      courseId
      instructor
      price
      blockTimestamp
      transactionHash
    }
  }
`;

// 特定课程的购买记录
export const GET_COURSE_PURCHASES = gql`
  query GetCoursePurchases($courseId: String!, $first: Int = 50) {
    coursePurchaseds(
      where: { courseId: $courseId }
      first: $first
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      student
      instructor
      price
      blockTimestamp
      transactionHash
    }
  }
`;

// 讲师的课程和收入统计
export const GET_INSTRUCTOR_STATS = gql`
  query GetInstructorStats($instructorAddress: String!) {
    # 讲师创建的课程
    courseCreateds(
      where: { instructor: $instructorAddress }
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      courseId
      price
      blockTimestamp
      transactionHash
    }
    
    # 讲师的课程销售记录
    coursePurchaseds(
      where: { instructor: $instructorAddress }
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      courseId
      student
      price
      blockTimestamp
      transactionHash
    }
  }
`;