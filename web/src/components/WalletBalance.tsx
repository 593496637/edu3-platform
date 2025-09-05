import { useAccount } from "wagmi";
import { Wallet, Coins, RefreshCw } from "lucide-react";
import { useETHBalance, useYDBalance } from "../hooks/useTokenExchange";

export default function WalletBalance() {
  const { address, isConnected } = useAccount();
  const { formatted: ethBalance, isLoading: ethLoading, refetch: refetchETH } = useETHBalance();
  const { formatted: ydBalance, isLoading: ydLoading, refetch: refetchYD } = useYDBalance();

  if (!isConnected) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Wallet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              钱包未连接
            </h3>
            <p className="text-sm text-gray-500">
              请连接钱包查看余额信息
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleRefresh = () => {
    refetchETH();
    refetchYD();
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">钱包余额</h3>
        <button
          onClick={handleRefresh}
          className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          disabled={ethLoading || ydLoading}
        >
          <RefreshCw className={`h-4 w-4 ${ethLoading || ydLoading ? 'animate-spin' : ''}`} />
          <span>刷新</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* ETH 余额 */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">ETH</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Ethereum</p>
              <p className="text-xs text-gray-500">用于兑换和支付Gas费</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">
              {ethLoading ? "..." : ethBalance}
            </p>
            <p className="text-xs text-gray-500">ETH</p>
          </div>
        </div>

        {/* YD Token 余额 */}
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Coins className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">YD Token</p>
              <p className="text-xs text-gray-500">平台代币，用于购买课程</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">
              {ydLoading ? "..." : parseFloat(ydBalance).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">YD</p>
          </div>
        </div>
      </div>

      {/* 钱包地址 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2">钱包地址</p>
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
          <code className="text-sm text-gray-700 font-mono">
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""}
          </code>
          <button
            onClick={() => navigator.clipboard.writeText(address || "")}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            复制
          </button>
        </div>
      </div>
    </div>
  );
}