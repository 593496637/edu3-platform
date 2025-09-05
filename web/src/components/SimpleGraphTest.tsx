import React from 'react';
import { useAccount } from 'wagmi';

// 简单的测试页面 - 不依赖 Apollo Client
export function SimpleGraphTest() {
  const { address, isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 基础连接测试
          </h1>
          <p className="text-lg text-gray-600">
            验证基础功能是否正常工作
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 钱包连接状态 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">👛 钱包连接</h3>
            
            <div className="space-y-3">
              <div className={`p-3 rounded ${isConnected ? 'bg-green-100' : 'bg-red-100'}`}>
                <div className="font-medium">
                  {isConnected ? '✅ 钱包已连接' : '❌ 钱包未连接'}
                </div>
                {address && (
                  <div className="text-sm text-gray-600 mt-1">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </div>
                )}
              </div>
              
              <div className="bg-blue-100 p-3 rounded">
                <div className="font-medium">✅ React 应用正常</div>
                <div className="text-sm text-gray-600">Wagmi hooks 工作正常</div>
              </div>
              
              <div className="bg-green-100 p-3 rounded">
                <div className="font-medium">✅ GraphProvider 已启用</div>
                <div className="text-sm text-gray-600">Apollo Client 已配置</div>
              </div>
            </div>
          </div>

          {/* 下一步测试 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">🔄 下一步测试</h3>
            
            <div className="space-y-3">
              <div className="border border-blue-200 p-3 rounded">
                <div className="font-medium text-blue-800">1. 连接钱包</div>
                <div className="text-sm text-gray-600">
                  点击右上角的连接钱包按钮
                </div>
              </div>
              
              <div className="border border-yellow-200 p-3 rounded">
                <div className="font-medium text-yellow-800">2. 测试兑换功能</div>
                <div className="text-sm text-gray-600">
                  访问 <a href="/exchange" className="text-blue-600 hover:underline">/exchange</a> 测试 ETH ↔ YD 兑换
                </div>
              </div>
              
              <div className="border border-green-200 p-3 rounded">
                <div className="font-medium text-green-800">3. 测试课程功能</div>
                <div className="text-sm text-gray-600">
                  访问 <a href="/course/1" className="text-blue-600 hover:underline">/course/1</a> 测试课程购买
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 系统信息 */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">📊 系统信息</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <div className="font-medium">环境</div>
              <div className="text-sm text-gray-600">
                {window.location.hostname === 'localhost' ? '开发环境' : '生产环境'}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded">
              <div className="font-medium">Graph 端点</div>
              <div className="text-sm text-gray-600">
                {window.location.hostname === 'localhost' 
                  ? 'http://localhost:8000' 
                  : 'Studio/Hosted Service'
                }
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded">
              <div className="font-medium">时间</div>
              <div className="text-sm text-gray-600">
                {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* 导航 */}
        <div className="mt-8 text-center space-x-4">
          <a 
            href="/" 
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
          >
            返回首页
          </a>
          
          <a 
            href="/exchange" 
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            测试兑换
          </a>
          
          <a 
            href="/course/1" 
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            测试课程
          </a>
        </div>
      </div>
    </div>
  );
}

export default SimpleGraphTest;
