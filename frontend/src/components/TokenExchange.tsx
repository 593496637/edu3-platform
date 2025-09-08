import React, { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useReadContract, useBalance, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { CONTRACTS, EXCHANGE_RATE } from '../lib/contracts'

export function TokenExchange() {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy')
  const [ethAmount, setEthAmount] = useState('')
  const [ydAmount, setYdAmount] = useState('')

  // 获取ETH余额
  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
    address: address,
  })

  // 获取YD余额
  const { data: ydBalance, refetch: refetchYdBalance } = useReadContract({
    ...CONTRACTS.YD_TOKEN,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  // 获取合约ETH余额（用于卖出时检查流动性）
  const { data: contractEthBalance } = useBalance({
    address: CONTRACTS.YD_TOKEN.address,
  })

  // 购买YD代币
  const { writeContract: buyTokens, data: buyHash, isPending: isBuyPending } = useWriteContract()
  const { isLoading: isBuyLoading, isSuccess: isBuySuccess } = useWaitForTransactionReceipt({
    hash: buyHash,
  })

  // 卖出YD代币
  const { writeContract: sellTokens, data: sellHash, isPending: isSellPending } = useWriteContract()
  const { isLoading: isSellLoading, isSuccess: isSellSuccess } = useWaitForTransactionReceipt({
    hash: sellHash,
  })

  // 处理输入变化
  const handleEthAmountChange = (value: string) => {
    setEthAmount(value)
    if (value && !isNaN(Number(value))) {
      const ethBigInt = parseEther(value)
      const calculatedYd = ethBigInt * EXCHANGE_RATE.ETH_TO_YD
      setYdAmount(formatEther(calculatedYd))
    } else {
      setYdAmount('')
    }
  }

  const handleYdAmountChange = (value: string) => {
    setYdAmount(value)
    if (value && !isNaN(Number(value))) {
      const ydBigInt = parseEther(value)
      const calculatedEth = ydBigInt / EXCHANGE_RATE.ETH_TO_YD
      setEthAmount(formatEther(calculatedEth))
    } else {
      setEthAmount('')
    }
  }

  // 执行购买
  const handleBuy = async () => {
    if (!ethAmount || !address) return
    
    try {
      const ethValue = parseEther(ethAmount)
      await buyTokens({
        ...CONTRACTS.YD_TOKEN,
        functionName: 'buyTokensWithETH',
        value: ethValue,
      })
    } catch (error) {
      console.error('Buy tokens failed:', error)
      alert('购买失败：' + (error as Error).message)
    }
  }

  // 执行卖出
  const handleSell = async () => {
    if (!ydAmount || !address) return
    
    try {
      const ydValue = parseEther(ydAmount)
      await sellTokens({
        ...CONTRACTS.YD_TOKEN,
        functionName: 'sellTokensForETH',
        args: [ydValue],
      })
    } catch (error) {
      console.error('Sell tokens failed:', error)
      alert('卖出失败：' + (error as Error).message)
    }
  }

  // 监听交易完成
  useEffect(() => {
    if (isBuySuccess || isSellSuccess) {
      // 刷新余额
      refetchEthBalance()
      refetchYdBalance()
      // 清空输入
      setEthAmount('')
      setYdAmount('')
    }
  }, [isBuySuccess, isSellSuccess, refetchEthBalance, refetchYdBalance])

  // 检查是否有足够余额
  const hasEnoughEth = ethBalance && ethAmount ? 
    ethBalance.value >= parseEther(ethAmount) : false
  const hasEnoughYd = ydBalance && ydAmount ? 
    ydBalance >= parseEther(ydAmount) : false

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">代币兑换</h2>
          <p className="text-gray-600">请先连接钱包使用兑换功能</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">代币兑换</h2>
        
        {/* 汇率信息 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="text-center">
            <p className="text-blue-800 font-medium">当前汇率</p>
            <p className="text-xl font-bold text-blue-900">1 ETH = 4,000 YD</p>
          </div>
        </div>

        {/* 余额显示 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">ETH 余额</p>
            <p className="text-lg font-semibold">
              {ethBalance ? Number(formatEther(ethBalance.value)).toFixed(4) : '0.0000'} ETH
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">YD 余额</p>
            <p className="text-lg font-semibold">
              {ydBalance ? Number(formatEther(ydBalance)).toFixed(2) : '0.00'} YD
            </p>
          </div>
        </div>

        {/* 标签切换 */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('buy')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'buy'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            购买 YD
          </button>
          <button
            onClick={() => setActiveTab('sell')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'sell'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            卖出 YD
          </button>
        </div>

        {activeTab === 'buy' ? (
          /* 购买界面 */
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                支付 ETH 数量
              </label>
              <input
                type="number"
                value={ethAmount}
                onChange={(e) => handleEthAmountChange(e.target.value)}
                placeholder="0.0"
                step="0.001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {ethAmount && !hasEnoughEth && (
                <p className="text-red-500 text-sm mt-1">ETH 余额不足</p>
              )}
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                ↓
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                获得 YD 数量
              </label>
              <input
                type="number"
                value={ydAmount}
                onChange={(e) => handleYdAmountChange(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleBuy}
              disabled={!ethAmount || !hasEnoughEth || isBuyPending || isBuyLoading}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isBuyPending || isBuyLoading ? '购买中...' : '购买 YD'}
            </button>
          </div>
        ) : (
          /* 卖出界面 */
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                卖出 YD 数量
              </label>
              <input
                type="number"
                value={ydAmount}
                onChange={(e) => handleYdAmountChange(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {ydAmount && !hasEnoughYd && (
                <p className="text-red-500 text-sm mt-1">YD 余额不足</p>
              )}
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                ↓
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                获得 ETH 数量
              </label>
              <input
                type="number"
                value={ethAmount}
                onChange={(e) => handleEthAmountChange(e.target.value)}
                placeholder="0.0000"
                step="0.001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 流动性提示 */}
            {contractEthBalance && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">
                  💡 合约流动性: {Number(formatEther(contractEthBalance.value)).toFixed(4)} ETH
                </p>
              </div>
            )}

            <button
              onClick={handleSell}
              disabled={!ydAmount || !hasEnoughYd || isSellPending || isSellLoading}
              className="w-full py-3 px-4 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSellPending || isSellLoading ? '卖出中...' : '卖出 YD'}
            </button>
          </div>
        )}

        {/* 交易状态提示 */}
        {(isBuySuccess || isSellSuccess) && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">
              ✅ 交易成功完成！
            </p>
          </div>
        )}
      </div>
    </div>
  )
}