import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACTS } from '../lib/contracts'

export function useTokenApproval(spender: `0x${string}`, amount: bigint) {
  const { address } = useAccount()
  const [isApproving, setIsApproving] = useState(false)
  
  // 检查当前授权额度
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    ...CONTRACTS.YD_TOKEN,
    functionName: 'allowance',
    args: address && spender ? [address, spender] : undefined,
  })

  // 授权交易
  const { writeContract: approve, data: approveHash, isPending: isApprovePending } = useWriteContract()
  
  // 等待授权交易确认
  const { isLoading: isApproveLoading, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  })

  // 检查是否需要授权
  const needsApproval = !allowance || allowance < amount
  
  // 调试信息
  console.log('🔍 Token approval debug:', {
    address,
    spender,
    amount: amount.toString(),
    allowance: allowance?.toString(),
    needsApproval,
    isApproving: isApproving || isApprovePending || isApproveLoading
  })

  // 执行授权
  const handleApprove = async () => {
    console.log('🔧 Starting approval process...')
    console.log('Address:', address)
    console.log('Spender:', spender)
    console.log('Amount:', amount.toString())
    
    if (!address || !spender) {
      console.log('❌ Missing address or spender')
      return
    }
    
    setIsApproving(true)
    try {
      console.log('📝 Calling approve contract...')
      const result = await approve({
        ...CONTRACTS.YD_TOKEN,
        functionName: 'approve',
        args: [spender, amount],
      })
      console.log('✅ Approve contract called, result:', result)
    } catch (error) {
      console.error('❌ Approval failed:', error)
      setIsApproving(false)
    }
  }

  // 监听授权完成
  useEffect(() => {
    if (isApproveSuccess) {
      setIsApproving(false)
      refetchAllowance() // 刷新授权额度
    }
  }, [isApproveSuccess, refetchAllowance])

  return {
    needsApproval,
    isApproving: isApproving || isApprovePending || isApproveLoading,
    handleApprove,
    allowance,
    refetchAllowance
  }
}