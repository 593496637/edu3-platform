// 合约地址和ABI配置
export const CONTRACTS = {
  YD_TOKEN: {
    address: '0xcD274B0B4cf04FfB5E6f1E17f8a62239a9564173' as `0x${string}`,
    abi: [
      'function balanceOf(address owner) view returns (uint256)',
      'function approve(address spender, uint256 amount) returns (bool)',
      'function allowance(address owner, address spender) view returns (uint256)',
      'function transfer(address to, uint256 amount) returns (bool)',
      'function decimals() view returns (uint8)',
      'function symbol() view returns (string)',
      'function name() view returns (string)',
      'function exchangeEthForYD() payable',
      'function exchangeYDForEth(uint256 amount)'
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