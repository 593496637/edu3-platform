import { PrismaClient } from '@prisma/client';
import { formatEther, parseEther } from 'ethers';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create sample system configs
    await prisma.systemConfig.createMany({
      data: [
        {
          key: 'platform_fee_percentage',
          value: '5',
          description: 'Platform fee percentage for course purchases',
        },
        {
          key: 'min_course_price',
          value: '10',
          description: 'Minimum course price in YD tokens',
        },
        {
          key: 'max_course_price',
          value: '10000',
          description: 'Maximum course price in YD tokens',
        },
        {
          key: 'instructor_approval_required',
          value: 'true',
          description: 'Whether instructor applications require manual approval',
        },
      ],
      skipDuplicates: true,
    });

    // Create sample users
    const sampleUsers = [
      {
        address: '0x1234567890123456789012345678901234567890',
        username: 'Alice_Web3',
        bio: 'Blockchain enthusiast and Web3 developer',
        isInstructor: true,
      },
      {
        address: '0x2345678901234567890123456789012345678901',
        username: 'Bob_Crypto',
        bio: 'Smart contract security expert',
        isInstructor: true,
      },
      {
        address: '0x3456789012345678901234567890123456789012',
        username: 'Charlie_DeFi',
        bio: 'DeFi protocol researcher',
        isInstructor: false,
      },
    ];

    const users = [];
    for (const userData of sampleUsers) {
      const user = await prisma.user.upsert({
        where: { address: userData.address.toLowerCase() },
        update: {},
        create: {
          address: userData.address.toLowerCase(),
          username: userData.username,
          bio: userData.bio,
          isInstructor: userData.isInstructor,
        },
      });
      users.push(user);
    }

    console.log('✅ Created sample users');

    // Create instructor applications for instructors
    for (const user of users.filter(u => u.isInstructor)) {
      await prisma.instructorApplication.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          status: 'APPROVED',
          reviewedAt: new Date(),
          reviewedBy: 'system',
          notes: 'Auto-approved during seeding',
        },
      });
    }

    console.log('✅ Created instructor applications');

    // Create sample courses
    const sampleCourses = [
      {
        onChainId: 1,
        title: 'Web3开发基础',
        description: '学习区块链和智能合约开发的基础知识，从零开始掌握Web3技术栈。',
        content: '这是一门全面的Web3开发入门课程...',
        price: '100',
        duration: '20小时',
        difficulty: 'BEGINNER' as const,
        category: 'Development',
        tags: ['Web3', 'Blockchain', 'Solidity', 'React'],
        requirements: [
          '具备基本的编程经验',
          '了解JavaScript基础',
          '对区块链技术有兴趣',
        ],
        objectives: [
          '理解区块链和以太坊的工作原理',
          '掌握Solidity智能合约开发',
          '学会构建DApp前端应用',
          '了解Web3开发最佳实践',
        ],
        instructorId: users[0].id,
      },
      {
        onChainId: 2,
        title: '智能合约安全进阶',
        description: '深入学习智能合约安全最佳实践，避免常见的安全漏洞。',
        content: '本课程将深入探讨智能合约安全...',
        price: '200',
        duration: '15小时',
        difficulty: 'ADVANCED' as const,
        category: 'Security',
        tags: ['Security', 'Solidity', 'Audit', 'Smart Contracts'],
        requirements: [
          '已掌握Solidity基础语法',
          '有智能合约开发经验',
          '了解以太坊虚拟机(EVM)',
        ],
        objectives: [
          '识别常见的智能合约漏洞',
          '掌握安全编码最佳实践',
          '学会使用安全审计工具',
          '理解去中心化安全原则',
        ],
        instructorId: users[1].id,
      },
      {
        onChainId: 3,
        title: 'DeFi协议开发实战',
        description: '通过实际项目学习DeFi协议的设计和开发。',
        content: '从零构建一个完整的DeFi协议...',
        price: '300',
        duration: '25小时',
        difficulty: 'INTERMEDIATE' as const,
        category: 'DeFi',
        tags: ['DeFi', 'AMM', 'Liquidity', 'Yield Farming'],
        requirements: [
          '熟练掌握Solidity开发',
          '了解DeFi基本概念',
          '有Web3前端开发经验',
        ],
        objectives: [
          '设计和实现AMM算法',
          '构建流动性挖矿机制',
          '集成多种DeFi协议',
          '优化Gas使用效率',
        ],
        instructorId: users[1].id,
      },
    ];

    const courses = [];
    for (const courseData of sampleCourses) {
      const course = await prisma.course.upsert({
        where: { onChainId: courseData.onChainId },
        update: {},
        create: courseData,
      });
      courses.push(course);
    }

    console.log('✅ Created sample courses');

    // Create sample lessons for each course
    const sampleLessons = [
      // Course 1 lessons
      {
        courseId: courses[0].id,
        title: 'Web3概述和区块链基础',
        description: '了解Web3的基本概念和区块链技术原理',
        content: '本节课将介绍Web3的核心概念...',
        duration: '45分钟',
        order: 1,
        isPreview: true,
        resources: {
          files: [
            { title: '区块链基础知识.pdf', url: '#', type: 'pdf' },
            { title: 'Web3术语表', url: '#', type: 'link' },
          ],
        },
      },
      {
        courseId: courses[0].id,
        title: 'Solidity语言基础',
        description: '学习Solidity编程语言的核心语法',
        content: '深入学习Solidity语言特性...',
        duration: '90分钟',
        order: 2,
        isPreview: false,
        resources: {
          files: [
            { title: 'Solidity官方文档', url: '#', type: 'link' },
            { title: '代码示例.sol', url: '#', type: 'code' },
          ],
        },
      },
      // Course 2 lessons
      {
        courseId: courses[1].id,
        title: '常见智能合约漏洞分析',
        description: '分析和理解常见的智能合约安全漏洞',
        content: '本节课将详细分析各种安全漏洞...',
        duration: '60分钟',
        order: 1,
        isPreview: true,
        resources: {
          files: [
            { title: '漏洞案例分析.pdf', url: '#', type: 'pdf' },
            { title: 'SWC Registry', url: '#', type: 'link' },
          ],
        },
      },
      // Course 3 lessons
      {
        courseId: courses[2].id,
        title: 'AMM算法设计与实现',
        description: '学习自动化做市商算法的设计原理',
        content: '深入理解AMM算法的数学原理...',
        duration: '120分钟',
        order: 1,
        isPreview: true,
        resources: {
          files: [
            { title: 'AMM白皮书.pdf', url: '#', type: 'pdf' },
            { title: 'Uniswap源码', url: '#', type: 'code' },
          ],
        },
      },
    ];

    for (const lessonData of sampleLessons) {
      await prisma.lesson.create({
        data: lessonData,
      });
    }

    console.log('✅ Created sample lessons');

    // Create sample enrollment (Charlie enrolls in Alice's course)
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: users[2].id,
          courseId: courses[0].id,
        },
      },
      update: {},
      create: {
        userId: users[2].id,
        courseId: courses[0].id,
        txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
        price: '100',
      },
    });

    console.log('✅ Created sample enrollment');

    // Create sample progress
    const lessons = await prisma.lesson.findMany({
      where: { courseId: courses[0].id },
    });

    if (lessons.length > 0) {
      await prisma.progress.create({
        data: {
          userId: users[2].id,
          courseId: courses[0].id,
          lessonId: lessons[0].id,
          completed: true,
          completedAt: new Date(),
          watchTime: 2700, // 45 minutes in seconds
        },
      });
    }

    console.log('✅ Created sample progress');

    // Create sample review
    await prisma.review.upsert({
      where: {
        userId_courseId: {
          userId: users[2].id,
          courseId: courses[0].id,
        },
      },
      update: {},
      create: {
        userId: users[2].id,
        courseId: courses[0].id,
        rating: 5,
        comment: '非常好的课程！老师讲解清晰，内容实用。',
      },
    });

    console.log('✅ Created sample review');

    console.log('🎉 Database seeding completed successfully!');
    console.log(`
📊 Seeding Summary:
- Users: ${users.length}
- Courses: ${courses.length}  
- Lessons: ${sampleLessons.length}
- Enrollments: 1
- Reviews: 1
- System Configs: 4
    `);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log('✅ Seeding process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding process failed:', error);
    process.exit(1);
  });
