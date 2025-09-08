// 合约地址和ABI配置
export const CONTRACTS = {
  YD_TOKEN: {
    address: '0xcD274B0B4cf04FfB5E6f1E17f8a62239a9564173' as `0x${string}`,
    abi: [
      {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'owner', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }]
      },
      {
        name: 'approve',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'spender', type: 'address' },
          { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ name: '', type: 'bool' }]
      },
      {
        name: 'allowance',
        type: 'function',
        stateMutability: 'view',
        inputs: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' }
        ],
        outputs: [{ name: '', type: 'uint256' }]
      },
      {
        name: 'transfer',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'to', type: 'address' },
          { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ name: '', type: 'bool' }]
      },
      {
        name: 'decimals',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint8' }]
      },
      {
        name: 'buyTokensWithETH',
        type: 'function',
        stateMutability: 'payable',
        inputs: [],
        outputs: []
      },
      {
        name: 'sellTokensForETH',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [{ name: 'tokenAmount', type: 'uint256' }],
        outputs: []
      },
      {
        name: 'getETHAmount',
        type: 'function',
        stateMutability: 'pure',
        inputs: [{ name: 'tokenAmount', type: 'uint256' }],
        outputs: [{ name: '', type: 'uint256' }]
      },
      {
        name: 'getTokenAmount',
        type: 'function',
        stateMutability: 'pure',
        inputs: [{ name: 'ethAmount', type: 'uint256' }],
        outputs: [{ name: '', type: 'uint256' }]
      }
    ] as const
  },
  COURSE_PLATFORM: {
    address: '0xD3Ff74DD494471f55B204CB084837D1a7f184092' as `0x${string}`,
    abi: [
      // 申请讲师相关
      {
        name: 'applyToBeInstructor',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [],
        outputs: []
      },
      {
        name: 'isInstructor',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [{ name: '', type: 'bool' }]
      },
      {
        name: 'instructorApplications',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [{ name: '', type: 'bool' }]
      },
      {
        name: 'approveInstructor',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [{ name: 'instructor', type: 'address' }],
        outputs: []
      },
      // 课程相关
      {
        name: 'createCourse',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [{ name: 'price', type: 'uint256' }],
        outputs: [{ name: '', type: 'uint256' }]
      },
      {
        name: 'getTotalCourses',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }]
      },
      {
        name: 'getUserPurchasedCourses',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [{ name: '', type: 'uint256[]' }]
      },
      {
        name: 'getAuthorCourses',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'author', type: 'address' }],
        outputs: [{ name: '', type: 'uint256[]' }]
      },
      {
        name: 'getCourse',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'courseId', type: 'uint256' }],
        outputs: [{ 
          name: '', 
          type: 'tuple',
          components: [
            { name: 'id', type: 'uint256' },
            { name: 'author', type: 'address' },
            { name: 'price', type: 'uint256' },
            { name: 'isActive', type: 'bool' },
            { name: 'createdAt', type: 'uint256' },
            { name: 'totalSales', type: 'uint256' },
            { name: 'studentCount', type: 'uint256' }
          ]
        }]
      },
      {
        name: 'buyCourse',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [{ name: 'courseId', type: 'uint256' }],
        outputs: []
      },
      {
        name: 'hasUserPurchasedCourse',
        type: 'function',
        stateMutability: 'view',
        inputs: [
          { name: 'courseId', type: 'uint256' },
          { name: 'user', type: 'address' }
        ],
        outputs: [{ name: '', type: 'bool' }]
      },
      // 事件
      {
        name: 'InstructorApplicationSubmitted',
        type: 'event',
        inputs: [{ name: 'applicant', type: 'address', indexed: true }]
      },
      {
        name: 'InstructorApproved',
        type: 'event',
        inputs: [{ name: 'instructor', type: 'address', indexed: true }]
      }
    ] as const
  }
} as const

export const EXCHANGE_RATE = {
  ETH_TO_YD: 4000n, // 1 ETH = 4000 YD
  YD_TO_ETH: 1n / 4000n
}