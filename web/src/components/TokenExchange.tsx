import { useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
// import { parseEther, formatEther } from "viem";
import { ArrowUpDown, Loader2 } from "lucide-react";
import { CONTRACTS, YD_TOKEN_ABI } from "../lib/contracts";
import { formatETH, formatYDToken, safeParseEther } from "../lib/utils";

export default function TokenExchange() {
  const { address, isConnected } = useAccount();
  const [ethAmount, setEthAmount] = useState("");
  const [isReverse, setIsReverse] = useState(false); // false: ETH -> YD, true: YD -> ETH

  // 获取汇率
  const { data: exchangeRate } = useReadContract({
    address: CONTRACTS.YDToken,
    abi: YD_TOKEN_ABI,
    functionName: "EXCHANGE_RATE",
  });

  // 获取YD代币余额
  const { data: ydBalance } = useReadContract({
    address: CONTRACTS.YDToken,
    abi: YD_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // 购买YD代币
  const {
    writeContract: buyTokens,
    data: buyHash,
    isPending: isBuyPending,
  } = useWriteContract();

  // 出售YD代币
  const {
    writeContract: sellTokens,
    data: sellHash,
    isPending: isSellPending,
  } = useWriteContract();

  // 等待交易确认
  const { isLoading: isBuyConfirming } = useWaitForTransactionReceipt({
    hash: buyHash,
  });

  const { isLoading: isSellConfirming } = useWaitForTransactionReceipt({
    hash: sellHash,
  });

  // 计算兑换数量
  const calculateAmount = () => {
    if (!ethAmount || !exchangeRate) return "0";

    try {
      const inputAmount = safeParseEther(ethAmount);
      if (inputAmount === 0n) return "0";

      if (isReverse) {
        // YD -> ETH
        const ethOut = inputAmount / exchangeRate;
        return formatETH(ethOut);
      } else {
        // ETH -> YD
        const ydOut = inputAmount * exchangeRate;
        return formatYDToken(ydOut);
      }
    } catch {
      return "0";
    }
  };

  const handleExchange = () => {
    if (!ethAmount || !isConnected) return;

    const inputAmount = safeParseEther(ethAmount);
    if (inputAmount === 0n) return;

    if (isReverse) {
      // 出售YD代币换ETH
      sellTokens({
        address: CONTRACTS.YDToken,
        abi: YD_TOKEN_ABI,
        functionName: "sellTokensForETH",
        args: [inputAmount],
      });
    } else {
      // 用ETH购买YD代币
      buyTokens({
        address: CONTRACTS.YDToken,
        abi: YD_TOKEN_ABI,
        functionName: "buyTokensWithETH",
        value: inputAmount,
      });
    }
  };

  const isLoading =
    isBuyPending || isSellPending || isBuyConfirming || isSellConfirming;

  return (
    <div className="card">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">代币兑换</h2>
        <div className="text-sm text-gray-500">
          汇率: 1 ETH = {exchangeRate?.toString() || "4000"} YD
        </div>
      </div>

      <div className="space-y-4">
        {/* 输入框 */}
        <div className="space-y-3">
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {isReverse ? "出售" : "支付"}
              </span>
              <span className="text-sm text-gray-500">
                {isReverse ? "YD代币" : "ETH"}
              </span>
            </div>
            <input
              type="number"
              value={ethAmount}
              onChange={(e) => setEthAmount(e.target.value)}
              placeholder="0.0"
              className="w-full bg-transparent text-2xl font-semibold outline-none"
            />
            {isReverse && ydBalance && (
              <div className="mt-1 text-xs text-gray-500">
                余额: {formatYDToken(ydBalance)} YD
              </div>
            )}
          </div>

          {/* 交换箭头 */}
          <div className="flex justify-center">
            <button
              onClick={() => setIsReverse(!isReverse)}
              className="rounded-full bg-gray-100 p-2 transition-colors hover:bg-gray-200"
            >
              <ArrowUpDown className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {isReverse ? "获得" : "获得"}
              </span>
              <span className="text-sm text-gray-500">
                {isReverse ? "ETH" : "YD代币"}
              </span>
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {calculateAmount()}
            </div>
          </div>
        </div>

        {/* 兑换按钮 */}
        <button
          onClick={handleExchange}
          disabled={!isConnected || !ethAmount || isLoading}
          className="btn btn-primary flex w-full items-center justify-center space-x-2 py-3 text-lg"
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

        {/* 交易状态 */}
        {(buyHash || sellHash) && (
          <div className="text-center text-sm text-gray-600">
            交易已提交，等待确认...
            <br />
            <a
              href={`https://sepolia.etherscan.io/tx/${buyHash || sellHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              查看交易详情
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
