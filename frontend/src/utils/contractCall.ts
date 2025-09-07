// 备用方案：直接使用ethers.js调用合约
import { ethers } from 'ethers'

const CONTRACT_ADDRESS = '0xD3Ff74DD494471f55B204CB084837D1a7f184092'

const SIMPLE_ABI = [
  'function applyToBeInstructor()',
  'function isInstructor(address user) view returns (bool)',
  'function instructorApplications(address user) view returns (bool)'
]

export async function applyToBeInstructorDirect() {
  try {
    console.log('🔄 使用ethers.js直接调用合约')
    
    // 获取provider和signer
    if (!window.ethereum) {
      throw new Error('请安装MetaMask')
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(CONTRACT_ADDRESS, SIMPLE_ABI, signer)
    
    console.log('📝 调用 applyToBeInstructor...')
    const tx = await contract.applyToBeInstructor()
    console.log('📄 交易哈希:', tx.hash)
    
    console.log('⏳ 等待交易确认...')
    const receipt = await tx.wait()
    console.log('✅ 交易成功确认:', receipt.hash)
    
    return { success: true, txHash: receipt.hash }
  } catch (error) {
    console.error('❌ 合约调用失败:', error)
    return { success: false, error: error.message }
  }
}

export async function checkInstructorStatusDirect(address: string) {
  try {
    if (!window.ethereum) {
      return { isInstructor: false, hasApplied: false }
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, SIMPLE_ABI, provider)
    
    const [isInstructor, hasApplied] = await Promise.all([
      contract.isInstructor(address),
      contract.instructorApplications(address)
    ])
    
    console.log('📊 状态查询结果:', { isInstructor, hasApplied })
    return { isInstructor, hasApplied }
  } catch (error) {
    console.error('❌ 状态查询失败:', error)
    return { isInstructor: false, hasApplied: false }
  }
}