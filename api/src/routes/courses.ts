import express from 'express';
import { ethers } from 'ethers';

const router = express.Router();

// 合约配置 (直接在这里定义，避免导入问题)
const CONTRACTS = {
  YDToken: '0xcD274B0B4cf04FfB5E6f1E17f8a62239a9564173',
  CoursePlatform: '0xD3Ff74DD494471f55B204CB084837D1a7f184092',
};

// 简化的 Course Platform ABI (只包含需要的函数)
const COURSE_PLATFORM_ABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "courseId", "type": "uint256"},
      {"internalType": "address", "name": "user", "type": "address"}
    ],
    "name": "hasPurchasedCourse",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "courseId", "type": "uint256"}],
    "name": "getCoursePrice",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "courseId", "type": "uint256"}],
    "name": "getCourseAuthor",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalCourses",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "courseId", "type": "uint256"}],
    "name": "getCourse",
    "outputs": [
      {"internalType": "address", "name": "instructor", "type": "address"},
      {"internalType": "uint256", "name": "price", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// 模拟课程数据 (实际项目中应该从数据库获取)
let mockCourses = [
  {
    id: 1,
    chain_id: 1,
    title: "Web3开发基础",
    description: "学习Web3开发的基础知识，包括以太坊、智能合约和DApp开发。",
    price: "1000000000000000000", // 1 ETH in wei
    priceformatted: "1.0",
    instructor_address: "0x1234567890123456789012345678901234567890",
    created_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    chain_id: 2,
    title: "智能合约安全",
    description: "深入了解智能合约安全最佳实践，学习如何编写安全的智能合约。",
    price: "2000000000000000000", // 2 ETH in wei
    priceformatted: "2.0",
    instructor_address: "0x2345678901234567890123456789012345678901",
    created_at: "2024-01-02T00:00:00Z"
  },
  {
    id: 3,
    chain_id: 3,
    title: "DeFi协议开发",
    description: "学习去中心化金融(DeFi)协议的开发，包括AMM、借贷协议等。",
    price: "3000000000000000000", // 3 ETH in wei
    priceformatted: "3.0",
    instructor_address: "0x3456789012345678901234567890123456789012",
    created_at: "2024-01-03T00:00:00Z"
  }
];

// 获取所有课程列表
router.get('/', async (req, res) => {
  try {
    // 在实际项目中，这里应该从数据库查询课程
    // 这里使用模拟数据
    
    // 可选：从区块链获取最新的课程数据
    try {
      const rpcUrl = process.env.RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY';
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const contract = new ethers.Contract(
        CONTRACTS.CoursePlatform,
        COURSE_PLATFORM_ABI,
        provider
      );

      // 获取总课程数
      const totalCourses = await contract.getTotalCourses();
      console.log(`Total courses on blockchain: ${totalCourses}`);
      
      // 这里可以根据需要从区块链获取更多课程信息
    } catch (blockchainError) {
      console.warn('Failed to fetch from blockchain, using mock data:', blockchainError.message);
    }

    res.json({
      success: true,
      data: {
        courses: mockCourses,
        total: mockCourses.length
      }
    });

  } catch (error) {
    console.error('Failed to fetch courses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch courses'
    });
  }
});

// 获取单个课程详情
router.get('/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const courseIdNum = parseInt(courseId);

    // 从模拟数据查找课程
    const course = mockCourses.find(c => c.id === courseIdNum);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // 可选：从区块链获取最新的价格信息
    try {
      const rpcUrl = process.env.RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY';
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const contract = new ethers.Contract(
        CONTRACTS.CoursePlatform,
        COURSE_PLATFORM_ABI,
        provider
      );

      const [instructor, price] = await contract.getCourse(BigInt(course.chain_id));
      
      // 更新课程信息
      course.instructor_address = instructor;
      course.price = price.toString();
      course.priceformatted = ethers.formatEther(price);
    } catch (blockchainError) {
      console.warn('Failed to fetch course from blockchain:', blockchainError.message);
    }

    res.json({
      success: true,
      data: course
    });

  } catch (error) {
    console.error('Failed to fetch course:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch course'
    });
  }
});

// 创建课程
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      content,
      price,
      duration,
      difficulty,
      category,
      tags,
      requirements,
      objectives,
      thumbnail,
      onChainId
    } = req.body;

    // 验证必填字段
    if (!title || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, description, price, category'
      });
    }

    // 在实际项目中，这里应该:
    // 1. 验证用户是否为讲师
    // 2. 创建课程记录到数据库
    // 3. 可选：同时在区块链上创建课程

    // 临时实现：添加到模拟数据
    const newCourse = {
      id: mockCourses.length + 1,
      chain_id: onChainId || mockCourses.length + 1,
      title,
      description,
      content: content || description,
      price: price.toString(),
      priceformatted: (parseFloat(price) / 1e18).toString(), // 假设价格以wei为单位
      duration: duration || "待定",
      difficulty: difficulty || "BEGINNER",
      category: category || "Development",
      tags: tags || [],
      requirements: requirements || [],
      objectives: objectives || [],
      thumbnail: thumbnail || "https://via.placeholder.com/300x200",
      instructor_address: "0x1234567890123456789012345678901234567890", // 这里应该从JWT token获取
      created_at: new Date().toISOString(),
      enrollmentCount: 0,
      reviewCount: 0
    };

    // 添加到模拟数据数组
    mockCourses.push(newCourse);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: newCourse
    });

  } catch (error) {
    console.error('Failed to create course:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create course'
    });
  }
});

// 更新课程信息
router.put('/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const courseIdNum = parseInt(courseId);

    const updateData = req.body;

    // 查找要更新的课程
    const courseIndex = mockCourses.findIndex(c => c.id === courseIdNum);

    if (courseIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // 更新课程数据
    mockCourses[courseIndex] = {
      ...mockCourses[courseIndex],
      ...updateData,
      updated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: mockCourses[courseIndex]
    });

  } catch (error) {
    console.error('Failed to update course:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update course'
    });
  }
});

// 删除课程
router.delete('/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const courseIdNum = parseInt(courseId);

    const courseIndex = mockCourses.findIndex(c => c.id === courseIdNum);

    if (courseIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // 从数组中移除课程
    const deletedCourse = mockCourses.splice(courseIndex, 1)[0];

    res.json({
      success: true,
      message: 'Course deleted successfully',
      data: deletedCourse
    });

  } catch (error) {
    console.error('Failed to delete course:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete course'
    });
  }
});

// 验证用户是否购买了课程
router.post('/:courseId/verify-access', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userAddress, signature } = req.body;

    if (!userAddress || !courseId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }

    // 1. 连接到区块链验证购买状态
    const rpcUrl = process.env.RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY';
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(
      CONTRACTS.CoursePlatform,
      COURSE_PLATFORM_ABI,
      provider
    );

    // 2. 查询链上购买状态
    const hasPurchased = await contract.hasPurchasedCourse(
      BigInt(courseId),
      userAddress
    );

    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        error: 'Course not purchased',
        needsPurchase: true
      });
    }

    // 3. 生成访问令牌 (简单版本)
    const accessToken = ethers.keccak256(
      ethers.toUtf8Bytes(`${userAddress}-${courseId}-${Date.now()}`)
    );

    res.json({
      success: true,
      data: {
        hasAccess: true,
        accessToken,
        courseId,
        userAddress
      }
    });

  } catch (error) {
    console.error('Course access verification failed:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 获取受保护的课程内容
router.get('/:courseId/content', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userAddress } = req.query;
    const authToken = req.headers.authorization?.replace('Bearer ', '');

    if (!userAddress || !authToken) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized access'
      });
    }

    // 重新验证购买状态 (防止伪造)
    const rpcUrl = process.env.RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY';
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(
      CONTRACTS.CoursePlatform,
      COURSE_PLATFORM_ABI,
      provider
    );

    const hasPurchased = await contract.hasPurchasedCourse(
      BigInt(courseId),
      userAddress
    );

    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        error: 'Access denied - course not purchased'
      });
    }

    // 返回课程内容 (从数据库或文件系统)
    const courseContent = {
      id: courseId,
      title: `Web3开发基础课程 ${courseId}`,
      videoUrl: `https://example.com/videos/course-${courseId}.mp4`,
      materials: [
        {
          type: 'pdf',
          title: '课程讲义',
          url: `https://example.com/materials/course-${courseId}-slides.pdf`
        },
        {
          type: 'code',
          title: '示例代码',
          url: `https://github.com/example/course-${courseId}-code`
        }
      ],
      lessons: [
        {
          id: 1,
          title: 'Web3概述和区块链基础',
          videoUrl: `https://example.com/videos/course-${courseId}-lesson-1.mp4`,
          duration: '45分钟'
        },
        {
          id: 2,
          title: '以太坊网络和智能合约介绍',
          videoUrl: `https://example.com/videos/course-${courseId}-lesson-2.mp4`,
          duration: '60分钟'
        },
        // 更多课程内容...
      ]
    };

    res.json({
      success: true,
      data: courseContent
    });

  } catch (error) {
    console.error('Failed to fetch course content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load course content'
    });
  }
});

export default router;
