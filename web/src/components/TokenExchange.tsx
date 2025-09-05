import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ArrowUpDown, Loader2, RefreshCw } from "lucide-react";
import { 
  useETHBalance, 
  useYDBalance, 
  useBuyYDTokens, 
  useSellYDTokens, 
  useExchangeCalculations 
} from "../hooks/useTokenExchange";

export default function TokenExchange() {
  const { isConnected } = useAccount();
  const [ethAmount, setEthAmount] = useState("");
  const [ydAmount, setYdAmount] = useState("");
  const [isReverse, setIsReverse] = useState(false); // false: ETH -> YD, true: YD -> ETH
  const [error, setError] = useState<string | null>(null);

  // 获取余额
  const { balance: ethBalance, formatted: ethFormatted, refetch: refetchETH } = useETHBalance();
  const { balance: ydBalance, formatted: ydFormatted, refetch: refetchYD } = useYDBalance();

  // 兑换操作
  const { buyTokens, isLoading: isBuying, isSuccess: buySuccess, error: buyError } = useBuyYDTokens();
  const { sellTokens, isLoading: isSelling, isSuccess: sellSuccess, error: sellError } = useSellYDTokens();

  // 计算工具
  const { calculateYDFromETH, calculateETHFromYD, rate } = useExchangeCalculations();

  // 处理输入变化
  useEffect(() => {
    if (isReverse) {
      // YD -> ETH 模式，根据 YD 数量计算 ETH
      if (ydAmount) {
        const ethResult = calculateETHFromYD(ydAmount);
        setEthAmount(ethResult);
      } else {
        setEthAmount("");
      }
    } else {
      // ETH -> YD 模式，根据 ETH 数量计算 YD
      if (ethAmount) {
        const ydResult = calculateYDFromETH(ethAmount);
        setYdAmount(ydResult);
      } else {
        setYdAmount("");
      }
    }
  }, [ethAmount, ydAmount, isReverse, calculateYDFromETH, calculateETHFromYD]);

  // 重置表单
  const resetForm = () => {
    setEthAmount("");
    setYdAmount("");
    setError(null);
  };

  // 交换方向
  const toggleDirection = () => {
    setIsReverse(!isReverse);
    resetForm();
  };

  // 执行兑换
  const handleExchange = async () => {
    setError(null);
    
    if (!isConnected) {
      setError("请先连接钱包");
      return;
    }

    try {
      if (isReverse) {
        // 出售YD代币换ETH
        if (!ydAmount || parseFloat(ydAmount) <= 0) {
          setError("请输入有效的YD代币数量");
          return;
        }
        
        if (parseFloat(ydFormatted) < parseFloat(ydAmount)) {
          setError("YD代币余额不足");
          return;
        }
        
        await sellTokens(ydAmount);
      } else {
        // 用ETH购买YD代币
        if (!ethAmount || parseFloat(ethAmount) <= 0) {
          setError("请输入有效的ETH数量");
          return;
        }
        
        if (parseFloat(ethFormatted) < parseFloat(ethAmount)) {
          setError("ETH余额不足");
          return;
        }
        
        await buyTokens(ethAmount);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "交易失败");
    }
  };

  // 处理交易成功
  useEffect(() => {
    if (buySuccess || sellSuccess) {
      resetForm();
      // 刷新余额
      setTimeout(() => {
        refetchETH();
        refetchYD();
      }, 2000);
    }
  }, [buySuccess, sellSuccess, refetchETH, refetchYD]);

  // 设置快捷金额
  const setQuickAmount = (percentage: number) => {
    if (isReverse) {
      const amount = (parseFloat(ydFormatted) * percentage / 100).toFixed(2);
      setYdAmount(amount);
    } else {
      const amount = (parseFloat(ethFormatted) * percentage / 100).toFixed(4);
      setEthAmount(amount);
    }
  };

  const isLoading = isBuying || isSelling;
  const hasError = error || buyError || sellError;

  return (
    <div className="rounded-lg bg-white p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">代币兑换</h2>
        <div className="text-sm text-gray-500">
          汇率: 1 ETH = {rate.toLocaleString()} YD
        </div>
      </div>

      <div className="space-y-4">
        {/* 输入框 */}
        <div className="space-y-3">
          {/* 支付部分 */}
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {isReverse ? "出售" : "支付"}
              </span>
              <span className="text-sm text-gray-500">
                {isReverse ? "YD" : "ETH"}
              </span>
            </div>
            <input
              type="number"
              value={isReverse ? ydAmount : ethAmount}
              onChange={(e) => {
                const value = e.target.value;
                if (isReverse) {
                  setYdAmount(value);
                } else {
                  setEthAmount(value);
                }
              }}
              placeholder="0.0"
              className="w-full bg-transparent text-2xl font-semibold outline-none placeholder-gray-400"
              step="any"
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                余额: {isReverse ? ydFormatted : ethFormatted} {isReverse ? "YD" : "ETH"}
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => setQuickAmount(25)}
                  className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                >
                  25%
                </button>
                <button
                  onClick={() => setQuickAmount(50)}
                  className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                >
                  50%
                </button>
                <button
                  onClick={() => setQuickAmount(100)}
                  className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                >
                  MAX
                </button>
              </div>
            </div>
          </div>

          {/* 交换箭头 */}
          <div className="flex justify-center">
            <button
              onClick={toggleDirection}
              className="rounded-full bg-blue-100 p-3 transition-all hover:bg-blue-200 hover:scale-110"
              disabled={isLoading}
            >
              <ArrowUpDown className="h-5 w-5 text-blue-600" />
            </button>
          </div>

          {/* 获得部分 */}
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">获得</span>
              <span className="text-sm text-gray-500">
                {isReverse ? "ETH" : "YD"}
              </span>
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {isReverse ? ethAmount || "0.0" : ydAmount || "0.0"}
            </div>
          </div>
        </div>

        {/* 错误信息 */}
        {hasError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-600">
              {error || buyError || sellError}
            </p>
          </div>
        )}

        {/* 兑换按钮 */}
        <button
          onClick={handleExchange}
          disabled={!isConnected || isLoading || (!ethAmount && !ydAmount)}
          className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 py-3 text-lg font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>处理中...</span>
            </>
          ) : (
            <span>
              {!isConnected
                ? "请连接钱包"
                : isReverse
                  ? "出售YD代币"
                  : "购买YD代币"}
            </span>
          )}
        </button>

        {/* 余额刷新 */}
        <div className="flex items-center justify-center space-x-4 pt-2">
          <button
            onClick={() => {
              refetchETH();
              refetchYD();
            }}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <RefreshCw className="h-4 w-4" />
            <span>刷新余额</span>
          </button>
        </div>

        {/* 成功提示 */}
        {(buySuccess || sellSuccess) && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-3">
            <p className="text-sm text-green-600">
              🎉 兑换成功！余额将在几秒钟内更新。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}