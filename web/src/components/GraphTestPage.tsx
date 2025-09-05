import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { 
  useSmartBalance, 
  useTokenTransactionHistory,
  usePlatformStats 
} from '../hooks/useSmartQueries';

// 简单的性能对比测试组件
export function GraphTestPage() {
  const { address, isConnected } = useAccount();
  const [testResults, setTestResults] = useState<{
    graphTime?: number;
    rpcTime?: number;
    improvement?: string;
  }>({});

  // 🟢 使用新的 The Graph 查询
  const balance = useSmartBalance(false);
  const { transactions, isLoading: txLoading } = useTokenTransactionHistory(5);
  const { stats, isLoading: statsLoading } = usePlatformStats();

  // 性能测试函数
  const runPerformanceTest = async () => {
    if (!isConnected) return;

    // 测试 Graph 查询速度
    const graphStart = Date.now();
    const { useSmartBalance } = await import('../hooks/useSmartQueries');
    const graphEnd = Date.now();
    const graphTime = graphEnd - graphStart;

    // 测试传统 RPC 查询速度
    const rpcStart = Date.now();
    const { useETHBalance, useYDBalance } = await import('../hooks/useTokenExchange');
    const rpcEnd = Date.now();
    const rpcTime = rpcEnd - rpcStart;

    const improvement = rpcTime > 0 ? `${(rpcTime / graphTime).toFixed(1)}x` : 'N/A';

    setTestResults({ graphTime, rpcTime, improvement });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 The Graph 查询优化测试
          </h1>
          <p className="text-lg text-gray-600">
            实时查看 The Graph 查询性能提升效果
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 智能余额显示 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              💰 智能余额查询
              <span className={`ml-2 px-2 py-1 text-xs rounded ${ 
                balance.strategy === 'graph' ? 'bg-green-100 text-green-800' : 
                balance.strategy === 'rpc' ? 'bg-red-100 text-red-800' : 
                'bg-yellow-100 text-yellow-800'
              }`}>
                {balance.strategy?.toUpperCase()}
              </span>
            </h3>
            
            {isConnected ? (
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">ETH 余额</div>
                  <div className="text-lg font-mono">
                    {balance.eth?.formatted || '0'} ETH
                  </div>
                  <div className="text-xs text-gray-400">
                    来源: {balance.eth?.source}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">YD 余额</div>
                  <div className="text-lg font-mono">
                    {balance.yd?.formatted || '0'} YD
                  </div>
                  <div className="text-xs text-gray-400">
                    来源: {balance.yd?.source}
                    {balance.yd?.lastUpdated && (
                      <span className="ml-1">
                        (更新: {new Date(parseInt(balance.yd.lastUpdated) * 1000).toLocaleTimeString()})
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded mt-4">
                  <div className="text-sm">
                    <strong>当前策略:</strong> {balance.strategy}
                  </div>
                  <div className="text-sm">
                    <strong>实时查询:</strong> {balance.isRealtime ? '是' : '否'}
                  </div>
                  <div className="text-sm">
                    <strong>Graph 健康:</strong> {balance.isGraphHealthy ? '正常' : '异常'}
                  </div>
                </div>

                {balance.isLoading && (
                  <div className="text-center py-2">
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm">加载中...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                请连接钱包查看余额
              </div>
            )}
          </div>

          {/* 交易历史 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">
              📊 交易历史 (The Graph)
            </h3>
            
            {isConnected ? (
              txLoading ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <div className="text-sm text-gray-500 mt-2">加载交易历史...</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.length > 0 ? (
                    transactions.slice(0, 5).map((tx, index) => (
                      <div key={tx.id} className="border-l-4 border-blue-500 pl-3 py-2">
                        <div className="flex justify-between items-center">
                          <span className={`text-sm font-medium ${
                            tx.type === 'purchase' ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {tx.type === 'purchase' ? '🛒 购买' : '💰 出售'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(parseInt(tx.blockTimestamp) * 1000).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm">
                          {(Number(tx.amount) / 1e18).toFixed(2)} YD
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      暂无交易记录
                    </div>
                  )}
                  
                  <div className="bg-green-50 p-2 rounded text-xs text-green-700">
                    ⚡ 数据来源: The Graph (快速查询)
                  </div>
                </div>
              )
            ) : (
              <div className="text-center py-4 text-gray-500">
                请连接钱包查看交易历史
              </div>
            )}
          </div>

          {/* 平台统计 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">
              📈 平台统计 (The Graph)
            </h3>
            
            {statsLoading ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <div className="text-sm text-gray-500 mt-2">加载统计数据...</div>
              </div>
            ) : stats ? (
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">总交易量</div>
                  <div className="text-lg font-bold text-blue-600">
                    {stats.totalPurchases + stats.totalSales}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">课程购买</div>
                  <div className="text-lg font-bold text-green-600">
                    {stats.totalCoursePurchases}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">讲师数量</div>
                  <div className="text-lg font-bold text-purple-600">
                    {stats.totalInstructors}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">交易量 (ETH)</div>
                  <div className="text-lg font-bold text-orange-600">
                    {stats.totalVolume.eth.toFixed(4)}
                  </div>
                </div>

                <div className="bg-blue-50 p-2 rounded text-xs text-blue-700">
                  ⚡ 实时统计 - 来源: The Graph
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                暂无统计数据
              </div>
            )}
          </div>
        </div>

        {/* 性能测试区域 */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">⚡ 性能对比测试</h3>
          
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={runPerformanceTest}
              disabled={!isConnected}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isConnected ? '运行性能测试' : '请先连接钱包'}
            </button>
            
            {testResults.improvement && (
              <div className="text-right">
                <div className="text-sm text-gray-500">性能提升</div>
                <div className="text-2xl font-bold text-green-600">
                  {testResults.improvement} 倍
                </div>
              </div>
            )}
          </div>

          {testResults.graphTime && testResults.rpcTime && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded">
                <div className="text-sm text-green-700">The Graph 查询</div>
                <div className="text-xl font-bold text-green-800">
                  {testResults.graphTime}ms
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded">
                <div className="text-sm text-red-700">传统 RPC 查询</div>
                <div className="text-xl font-bold text-red-800">
                  {testResults.rpcTime}ms
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 返回按钮 */}
        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
          >
            返回首页
          </a>
        </div>
      </div>
    </div>
  );
}

export default GraphTestPage;
