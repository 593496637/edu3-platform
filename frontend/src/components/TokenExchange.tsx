import { useState } from 'react'
import { useAccount, useWriteContract, useReadContract, useBalance } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { CONTRACTS, EXCHANGE_RATE } from '../lib/contracts'

export function TokenExchange() {
  const { address } = useAccount()
  const [ethAmount, setEthAmount] = useState('')
  const [ydAmount, setYdAmount] = useState('')
  const [exchangeType, setExchangeType] = useState<'eth-to-yd' | 'yd-to-eth'>('eth-to-yd')
  
  const { writeContract, isPending } = useWriteContract()

  // 获取ETH余额
  const { data: ethBalance } = useBalance({
    address
  })

  // 获取YD余额
  const { data: ydBalance } = useReadContract({
    ...CONTRACTS.YD_TOKEN,
    functionName: 'balanceOf',
    args: address ? [address] : undefined
  })

  const handleExchangeTypeChange = (type: 'eth-to-yd' | 'yd-to-eth') => {
    setExchangeType(type)
    setEthAmount('')
    setYdAmount('')
  }

  const handleAmountChange = (value: string, type: 'eth' | 'yd') => {
    if (type === 'eth') {
      setEthAmount(value)
      if (exchangeType === 'eth-to-yd') {
        const ydValue = parseFloat(value) * Number(EXCHANGE_RATE.ETH_TO_YD)
        setYdAmount(ydValue.toString())
      }
    } else {
      setYdAmount(value)
      if (exchangeType === 'yd-to-eth') {
        const ethValue = parseFloat(value) / Number(EXCHANGE_RATE.ETH_TO_YD)
        setEthAmount(ethValue.toString())
      }
    }
  }

  const handleExchange = () => {
    if (!address) return

    if (exchangeType === 'eth-to-yd') {
      writeContract({
        ...CONTRACTS.YD_TOKEN,
        functionName: 'exchangeEthForYD',
        value: parseEther(ethAmount)
      })
    } else {
      writeContract({
        ...CONTRACTS.YD_TOKEN,
        functionName: 'exchangeYDForEth',
        args: [parseEther(ydAmount)]
      })
    }
  }

  if (!address) {
    return (
      <div className="p-6 bg-gray-100 rounded-lg text-center">
        <p>请先连接钱包</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">代币兑换</h2>
      
      {/* 余额显示 */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <p className="text-sm text-gray-600">当前余额:</p>
        <p>ETH: {ethBalance ? formatEther(ethBalance.value) : '0'}</p>
        <p>YD: {ydBalance ? formatEther(ydBalance) : '0'}</p>
      </div>

      {/* 兑换类型选择 */}
      <div className="mb-4">
        <div className="flex space-x-2">
          <button
            className={`flex-1 py-2 px-4 rounded ${
              exchangeType === 'eth-to-yd' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200'
            }`}
            onClick={() => handleExchangeTypeChange('eth-to-yd')}
          >
            ETH → YD
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded ${
              exchangeType === 'yd-to-eth' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200'
            }`}
            onClick={() => handleExchangeTypeChange('yd-to-eth')}
          >
            YD → ETH
          </button>
        </div>
      </div>

      {/* 兑换输入 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            {exchangeType === 'eth-to-yd' ? '输入 ETH 数量' : '输出 ETH 数量'}
          </label>
          <input
            type="number"
            value={ethAmount}
            onChange={(e) => handleAmountChange(e.target.value, 'eth')}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.0"
            disabled={exchangeType === 'yd-to-eth'}
          />
        </div>

        <div className="text-center">
          <span className="text-gray-500">汇率: 1 ETH = {EXCHANGE_RATE.ETH_TO_YD.toString()} YD</span>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {exchangeType === 'eth-to-yd' ? '获得 YD 数量' : '输入 YD 数量'}
          </label>
          <input
            type="number"
            value={ydAmount}
            onChange={(e) => handleAmountChange(e.target.value, 'yd')}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.0"
            disabled={exchangeType === 'eth-to-yd'}
          />
        </div>
      </div>

      <button
        onClick={handleExchange}
        disabled={isPending || !ethAmount || !ydAmount}
        className="w-full mt-6 py-3 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isPending ? '处理中...' : '确认兑换'}
      </button>
    </div>
  )
}