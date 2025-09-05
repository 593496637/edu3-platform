import { useAccount, useReadContract } from "wagmi";
import { User, Wallet, Settings, History, Award } from "lucide-react";
import { CONTRACTS, YD_TOKEN_ABI } from "../lib/contracts";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();

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

  // 获取ETH余额 (这里需要另外的方法获取)
  const { data: ethBalance } = useReadContract({
    address: address,
    abi: [],
    functionName: "balance",
    query: {
      enabled: false, // 暂时禁用，需要使用其他方法获取ETH余额
    },
  });

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              请先连接钱包
            </h3>
            <p className="mt-1 text-gray-500">
              连接钱包后查看您的个人信息
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">个人中心</h1>
          <p className="mt-2 text-gray-600">
            管理您的账户信息和钱包资产
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* 主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 钱包信息 */}
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center mb-4">
                <Wallet className="h-6 w-6 text-blue-600" />
                <h3 className="ml-2 text-lg font-semibold text-gray-900">
                  钱包信息
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    钱包地址
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 rounded-md bg-gray-100 px-3 py-2 text-sm font-mono">
                      {address}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(address || "")}
                      className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      复制
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ETH 余额
                    </label>
                    <div className="rounded-md bg-gray-100 px-3 py-2">
                      <span className="text-lg font-semibold">
                        -- ETH
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      YD 代币余额
                    </label>
                    <div className="rounded-md bg-gray-100 px-3 py-2">
                      <span className="text-lg font-semibold text-blue-600">
                        {ydBalance ? (Number(ydBalance) / 1e18).toFixed(2) : "0"} YD
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 交易历史 */}
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center mb-4">
                <History className="h-6 w-6 text-green-600" />
                <h3 className="ml-2 text-lg font-semibold text-gray-900">
                  交易历史
                </h3>
              </div>
              
              <div className="space-y-3">
                {/* 这里应该从链上或后端获取真实的交易历史 */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <div>
                    <p className="font-medium">购买课程: Web3开发基础</p>
                    <p className="text-sm text-gray-500">2024-01-15 14:30</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">-100 YD</p>
                    <p className="text-sm text-gray-500">已完成</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <div>
                    <p className="font-medium">ETH兑换YD代币</p>
                    <p className="text-sm text-gray-500">2024-01-14 10:15</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">+1000 YD</p>
                    <p className="text-sm text-gray-500">已完成</p>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    查看全部交易历史 →
                  </button>
                </div>
              </div>
            </div>

            {/* 成就徽章 */}
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center mb-4">
                <Award className="h-6 w-6 text-yellow-600" />
                <h3 className="ml-2 text-lg font-semibold text-gray-900">
                  成就徽章
                </h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-yellow-500 flex items-center justify-center">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm font-medium">首次购买</p>
                  <p className="text-xs text-gray-500">已获得</p>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-300 flex items-center justify-center">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm font-medium">学习达人</p>
                  <p className="text-xs text-gray-500">未获得</p>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-300 flex items-center justify-center">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm font-medium">课程完成</p>
                  <p className="text-xs text-gray-500">未获得</p>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-300 flex items-center justify-center">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm font-medium">分享专家</p>
                  <p className="text-xs text-gray-500">未获得</p>
                </div>
              </div>
            </div>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 账户统计 */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                账户统计
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">注册时间</span>
                  <span className="font-medium">2024-01-10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">购买课程数</span>
                  <span className="font-medium">2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">完成课程数</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">总学习时长</span>
                  <span className="font-medium">15.5 小时</span>
                </div>
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                快捷操作
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                  <Settings className="h-5 w-5 text-gray-400" />
                  <span>账户设置</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                  <Wallet className="h-5 w-5 text-gray-400" />
                  <span>钱包管理</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                  <History className="h-5 w-5 text-gray-400" />
                  <span>交易记录</span>
                </button>
              </div>
            </div>

            {/* 安全提示 */}
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <h4 className="font-medium text-yellow-800 mb-2">安全提示</h4>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>• 妥善保管您的私钥和助记词</p>
                <p>• 不要在不安全的环境中操作钱包</p>
                <p>• 定期检查账户异常活动</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
