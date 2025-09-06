import React from 'react';
import AdminPanel from '../components/AdminPanel';
import { useAdminFunctions } from '../hooks/useAdminFunctions';

export default function AdminPage() {
  const { isOwner, owner } = useAdminFunctions();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">平台管理中心</h1>
          <p className="mt-2 text-gray-600">
            管理讲师申请审核、平台设置和系统配置
          </p>
          {owner && (
            <p className="mt-1 text-xs text-gray-500">
              合约管理员: {owner}
            </p>
          )}
        </div>

        <AdminPanel />

        {/* 管理员权限说明 */}
        <div className="mt-8 rounded-lg bg-gray-50 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔐 管理员权限</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">讲师管理</h4>
              <ul className="space-y-1">
                <li>• 审核讲师申请</li>
                <li>• 批准/拒绝申请</li>
                <li>• 查看申请状态</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">平台设置</h4>
              <ul className="space-y-1">
                <li>• 调整手续费率</li>
                <li>• 管理课程状态</li>
                <li>• 系统配置管理</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 操作指南 */}
        <div className="mt-6 rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 操作指南</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">如何获取申请人地址？</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>方法1: 查看区块链浏览器的合约事件</p>
                <p className="ml-4">• 访问 Etherscan 等浏览器</p>
                <p className="ml-4">• 搜索课程平台合约地址</p>
                <p className="ml-4">• 查看 "Events" 标签</p>
                <p className="ml-4">• 找到 "InstructorApplicationSubmitted" 事件</p>
                
                <p className="mt-2">方法2: 用户主动提供</p>
                <p className="ml-4">• 让申请人提供其钱包地址</p>
                <p className="ml-4">• 在管理员面板中输入并审核</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-2">审核流程</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>1. 用户提交申请 → 合约记录申请状态</p>
                <p>2. 管理员获取申请人地址</p>
                <p>3. 在管理面板输入地址并批准</p>
                <p>4. 用户状态更新为已认证讲师</p>
                <p>5. 用户可开始创建付费课程</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}