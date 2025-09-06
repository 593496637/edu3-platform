import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';

const prisma = new PrismaClient();

async function main() {
  console.log('开始种子数据初始化...');

  // 清理现有数据 (可选，仅在开发环境使用)
  if (process.env.NODE_ENV === 'development') {
    console.log('清理现有数据...');
    await prisma.progress.deleteMany();
    await prisma.review.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.course.deleteMany();
    await prisma.instructorApplication.deleteMany();
    await prisma.user.deleteMany();
    await prisma.systemConfig.deleteMany();
  }

  // 创建示例用户
  console.log('创建示例用户...');
  const users = await Promise.all([
    prisma.user.create({
      data: {
        address: '0x1234567890123456789012345678901234567890',
        username: 'alice_instructor',
        email: 'alice@example.com',
        bio: '区块链开发专家，拥有5年Web3开发经验',
        isInstructor: true,
      },
    }),
    prisma.user.create({
      data: {
        address: '0x2345678901234567890123456789012345678901',
        username: 'bob_instructor',
        email: 'bob@example.com',
        bio: 'DeFi协议开发者，智能合约安全审计师',
        isInstructor: true,
      },
    }),
    prisma.user.create({
      data: {
        address: '0x3456789012345678901234567890123456789012',
        username: 'charlie_student',
        email: 'charlie@example.com',
        bio: 'Web3学习者，对区块链技术充满热情',
        isInstructor: false,
      },
    }),
  ]);

  console.log(`创建了 ${users.length} 个用户`);

  // 创建示例课程
  console.log('创建示例课程...');
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        onChainId: 1,
        title: 'Web3开发基础',
        description: '学习Web3开发的基础知识，包括以太坊、智能合约和DApp开发。从零开始构建你的第一个去中心化应用。',
        content: `
          ## 课程概述
          本课程将带你深入了解Web3开发的核心概念和实践技能。

          ## 你将学到什么
          - 区块链基础原理
          - 以太坊网络架构
          - Solidity智能合约开发
          - Web3.js/Ethers.js使用
          - DApp前端开发
          - MetaMask集成

          ## 课程特色
          - 实战项目驱动学习
          - 专业讲师指导
          - 完整代码示例
          - 社区支持
        `,
        price: ethers.parseEther('0.1').toString(), // 0.1 ETH
        thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
        duration: '20小时',
        difficulty: 'BEGINNER',
        category: 'Development',
        tags: ['Web3', 'Blockchain', 'Ethereum', 'Solidity', 'DApp'],
        requirements: [
          '具备基本的JavaScript编程经验',
          '了解HTML/CSS基础',
          '对区块链有基本了解'
        ],
        objectives: [
          '掌握区块链和以太坊基础概念',
          '能够编写和部署智能合约',
          '构建完整的DApp应用',
          '理解Web3开发最佳实践'
        ],
        instructorId: users[0].id,
        published: true,
      },
    }),
    prisma.course.create({
      data: {
        onChainId: 2,
        title: '智能合约安全最佳实践',
        description: '深入了解智能合约安全漏洞，学习如何编写安全的智能合约，掌握安全审计技巧。',
        content: `
          ## 课程简介
          智能合约安全是Web3开发中最关键的环节。本课程将教你识别和防范常见的安全漏洞。

          ## 课程内容
          - 常见安全漏洞分析
          - 安全编码规范
          - 审计工具使用
          - 实际案例分析
          - 最佳实践指南
        `,
        price: ethers.parseEther('0.2').toString(), // 0.2 ETH
        thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
        duration: '15小时',
        difficulty: 'INTERMEDIATE',
        category: 'Security',
        tags: ['Security', 'Smart Contract', 'Audit', 'Solidity'],
        requirements: [
          '熟悉Solidity编程',
          '有智能合约开发经验',
          '了解以太坊虚拟机(EVM)'
        ],
        objectives: [
          '识别常见安全漏洞',
          '编写安全的智能合约',
          '使用安全审计工具',
          '建立安全开发流程'
        ],
        instructorId: users[1].id,
        published: true,
      },
    }),
    prisma.course.create({
      data: {
        onChainId: 3,
        title: 'DeFi协议开发实战',
        description: '学习去中心化金融(DeFi)协议的开发，包括AMM、借贷协议、收益农场等核心机制。',
        content: `
          ## DeFi协议开发
          深入学习去中心化金融协议的设计和实现。

          ## 核心内容
          - AMM算法实现
          - 借贷协议设计
          - 流动性挖矿机制
          - 治理代币经济学
          - 跨链桥接技术
        `,
        price: ethers.parseEther('0.3').toString(), // 0.3 ETH
        thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
        duration: '25小时',
        difficulty: 'ADVANCED',
        category: 'DeFi',
        tags: ['DeFi', 'AMM', 'Lending', 'Yield Farming', 'Governance'],
        requirements: [
          '精通Solidity编程',
          '理解DeFi基础概念',
          '有复杂智能合约开发经验'
        ],
        objectives: [
          '设计和实现AMM协议',
          '构建借贷平台',
          '理解流动性挖矿机制',
          '掌握DeFi协议安全要点'
        ],
        instructorId: users[1].id,
        published: true,
      },
    }),
  ]);

  console.log(`创建了 ${courses.length} 门课程`);

  // 为每门课程创建课程章节
  console.log('创建课程章节...');
  
  // Web3开发基础课程的章节
  const web3Lessons = await Promise.all([
    prisma.lesson.create({
      data: {
        courseId: courses[0].id,
        title: '区块链基础概念',
        description: '了解区块链的基本原理、共识机制和去中心化特性',
        content: '详细介绍区块链技术的核心概念...',
        duration: '2小时',
        order: 1,
        isPreview: true,
      },
    }),
    prisma.lesson.create({
      data: {
        courseId: courses[0].id,
        title: '以太坊网络架构',
        description: '深入了解以太坊的技术架构和运行机制',
        content: '以太坊网络的详细技术分析...',
        duration: '3小时',
        order: 2,
        isPreview: true,
      },
    }),
    prisma.lesson.create({
      data: {
        courseId: courses[0].id,
        title: 'Solidity语言入门',
        description: '学习智能合约开发语言Solidity的基础语法',
        content: 'Solidity编程语言详解...',
        duration: '4小时',
        order: 3,
        isPreview: false,
      },
    }),
    prisma.lesson.create({
      data: {
        courseId: courses[0].id,
        title: '智能合约开发实战',
        description: '动手编写你的第一个智能合约',
        content: '实际编写智能合约的完整流程...',
        duration: '5小时',
        order: 4,
        isPreview: false,
      },
    }),
    prisma.lesson.create({
      data: {
        courseId: courses[0].id,
        title: 'DApp前端开发',
        description: '使用React和Web3.js构建去中心化应用前端',
        content: 'DApp前端开发完整教程...',
        duration: '6小时',
        order: 5,
        isPreview: false,
      },
    }),
  ]);

  // 智能合约安全课程的章节
  const securityLessons = await Promise.all([
    prisma.lesson.create({
      data: {
        courseId: courses[1].id,
        title: '常见安全漏洞分析',
        description: '深入分析重入攻击、整数溢出等常见漏洞',
        content: '智能合约安全漏洞详细分析...',
        duration: '3小时',
        order: 1,
        isPreview: true,
      },
    }),
    prisma.lesson.create({
      data: {
        courseId: courses[1].id,
        title: '安全编码规范',
        description: '学习编写安全智能合约的最佳实践',
        content: '安全编码标准和规范...',
        duration: '4小时',
        order: 2,
        isPreview: false,
      },
    }),
    prisma.lesson.create({
      data: {
        courseId: courses[1].id,
        title: '审计工具实操',
        description: '使用MythX、Slither等工具进行安全审计',
        content: '安全审计工具使用指南...',
        duration: '4小时',
        order: 3,
        isPreview: false,
      },
    }),
    prisma.lesson.create({
      data: {
        courseId: courses[1].id,
        title: '实际案例研究',
        description: '分析真实的智能合约攻击事件',
        content: '历史攻击事件深度分析...',
        duration: '4小时',
        order: 4,
        isPreview: false,
      },
    }),
  ]);

  // DeFi协议课程的章节
  const defiLessons = await Promise.all([
    prisma.lesson.create({
      data: {
        courseId: courses[2].id,
        title: 'DeFi生态概览',
        description: '了解DeFi生态系统的核心组成部分',
        content: 'DeFi生态系统全景分析...',
        duration: '3小时',
        order: 1,
        isPreview: true,
      },
    }),
    prisma.lesson.create({
      data: {
        courseId: courses[2].id,
        title: 'AMM算法实现',
        description: '深入理解并实现自动做市商算法',
        content: 'AMM算法原理和代码实现...',
        duration: '6小时',
        order: 2,
        isPreview: false,
      },
    }),
    prisma.lesson.create({
      data: {
        courseId: courses[2].id,
        title: '借贷协议开发',
        description: '构建去中心化借贷平台',
        content: '借贷协议设计和实现...',
        duration: '8小时',
        order: 3,
        isPreview: false,
      },
    }),
    prisma.lesson.create({
      data: {
        courseId: courses[2].id,
        title: '流动性挖矿机制',
        description: '设计代币激励和收益分发机制',
        content: '流动性挖矿完整实现...',
        duration: '8小时',
        order: 4,
        isPreview: false,
      },
    }),
  ]);

  console.log(`创建了 ${web3Lessons.length + securityLessons.length + defiLessons.length} 个课程章节`);

  // 创建示例注册记录
  console.log('创建示例注册记录...');
  const enrollments = await Promise.all([
    prisma.enrollment.create({
      data: {
        userId: users[2].id, // charlie_student
        courseId: courses[0].id, // Web3开发基础
        txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        price: courses[0].price,
      },
    }),
    prisma.enrollment.create({
      data: {
        userId: users[2].id, // charlie_student
        courseId: courses[1].id, // 智能合约安全
        txHash: '0x2345678901bcdefg2345678901bcdefg2345678901bcdefg2345678901bcdefg',
        price: courses[1].price,
      },
    }),
  ]);

  console.log(`创建了 ${enrollments.length} 条注册记录`);

  // 创建学习进度记录
  console.log('创建学习进度记录...');
  const progressRecords = await Promise.all([
    // Charlie完成了Web3基础课程的前两个章节
    prisma.progress.create({
      data: {
        userId: users[2].id,
        courseId: courses[0].id,
        lessonId: web3Lessons[0].id,
        completed: true,
        completedAt: new Date(),
        watchTime: 7200, // 2小时
      },
    }),
    prisma.progress.create({
      data: {
        userId: users[2].id,
        courseId: courses[0].id,
        lessonId: web3Lessons[1].id,
        completed: true,
        completedAt: new Date(),
        watchTime: 10800, // 3小时
      },
    }),
    prisma.progress.create({
      data: {
        userId: users[2].id,
        courseId: courses[0].id,
        lessonId: web3Lessons[2].id,
        completed: false,
        watchTime: 1800, // 30分钟，未完成
      },
    }),
  ]);

  console.log(`创建了 ${progressRecords.length} 条学习进度记录`);

  // 创建课程评价
  console.log('创建课程评价...');
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        userId: users[2].id,
        courseId: courses[0].id,
        rating: 5,
        comment: '非常棒的Web3入门课程！讲师讲解清晰，实战项目很有帮助。强烈推荐给Web3初学者。',
      },
    }),
    prisma.review.create({
      data: {
        userId: users[2].id,
        courseId: courses[1].id,
        rating: 4,
        comment: '智能合约安全内容很全面，案例分析很实用。希望能增加更多实际漏洞挖掘的实操练习。',
      },
    }),
  ]);

  console.log(`创建了 ${reviews.length} 条课程评价`);

  // 创建系统配置
  console.log('创建系统配置...');
  const systemConfigs = await Promise.all([
    prisma.systemConfig.create({
      data: {
        key: 'platform_fee',
        value: '0.05', // 5% 平台手续费
        description: '平台交易手续费比例',
      },
    }),
    prisma.systemConfig.create({
      data: {
        key: 'min_course_price',
        value: ethers.parseEther('0.01').toString(), // 最低课程价格 0.01 ETH
        description: '课程最低价格限制(wei)',
      },
    }),
    prisma.systemConfig.create({
      data: {
        key: 'max_course_price',
        value: ethers.parseEther('10').toString(), // 最高课程价格 10 ETH
        description: '课程最高价格限制(wei)',
      },
    }),
  ]);

  console.log(`创建了 ${systemConfigs.length} 条系统配置`);

  console.log('✅ 种子数据初始化完成！');
  
  // 输出统计信息
  const stats = {
    users: await prisma.user.count(),
    courses: await prisma.course.count(),
    lessons: await prisma.lesson.count(),
    enrollments: await prisma.enrollment.count(),
    progress: await prisma.progress.count(),
    reviews: await prisma.review.count(),
    systemConfigs: await prisma.systemConfig.count(),
  };

  console.log('\n📊 数据库统计:');
  console.log(`用户数: ${stats.users}`);
  console.log(`课程数: ${stats.courses}`);
  console.log(`章节数: ${stats.lessons}`);
  console.log(`注册记录: ${stats.enrollments}`);
  console.log(`进度记录: ${stats.progress}`);
  console.log(`评价数: ${stats.reviews}`);
  console.log(`系统配置: ${stats.systemConfigs}`);
}

main()
  .catch((e) => {
    console.error('❌ 种子数据初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
