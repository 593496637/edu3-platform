import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useAdminFunctions } from '../hooks/useAdminFunctions';
import ApplicationMonitor from './ApplicationMonitor';

const AdminPanel: React.FC = () => {
  const { isConnected } = useAccount();
  const { isOwner, isProcessing, error, approveInstructor, setPlatformFeeRate, setError } = useAdminFunctions();
  
  const [applicantAddress, setApplicantAddress] = useState('');
  const [newFeeRate, setNewFeeRate] = useState('250'); // 2.5%
  const [approvedApplications, setApprovedApplications] = useState<string[]>([]);

  // 处理讲师申请审核
  const handleApproveInstructor = async () => {
    if (!applicantAddress) {
      setError('请输入申请人地址');
      return;
    }

    if (!applicantAddress.startsWith('0x') || applicantAddress.length !== 42) {
      setError('请输入有效的以太坊地址');
      return;
    }

    await approveInstructor(applicantAddress);
    
    // 审核成功后添加到已审核列表
    if (!error) {
      setApprovedApplications(prev => [...prev, applicantAddress]);
      setApplicantAddress('');
    }
  };

  // 处理手续费率设置
  const handleSetFeeRate = async () => {
    const feeRateNumber = parseInt(newFeeRate);
    if (isNaN(feeRateNumber) || feeRateNumber < 0 || feeRateNumber > 1000) {
      setError('手续费率必须在0-10%之间（0-1000基点）');
      return;
    }

    await setPlatformFeeRate(feeRateNumber);
  };

  if (!isConnected) {
    return (
      <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
        <p className="text-yellow-800">请先连接钱包以访问管理员面板</p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4">
        <p className="text-red-800">您不是合约管理员，无权访问此页面</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3">
          <p className="text-red-800 text-sm">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-xs text-red-600 hover:text-red-800"
          >
            ✕ 关闭
          </button>
        </div>
      )}

      {/* 申请监控组件 - 自动获取申请列表 */}
      <ApplicationMonitor />

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">管理员控制面板</h2>

        {/* 手动审核区域 */}
        <div className="border-b border-gray-200 pb-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">✍️ 手动审核申请</h3>
          <p className="text-sm text-gray-600 mb-4">
            如果上方的自动监控没有显示申请，您也可以手动输入申请人地址进行审核
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                申请人钱包地址
              </label>
              <input
                type="text"
                value={applicantAddress}
                onChange={(e) => setApplicantAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={handleApproveInstructor}
              disabled={isProcessing || !applicantAddress}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isProcessing || !applicantAddress
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isProcessing ? '处理中...' : '✅ 手动批准申请'}
            </button>
          </div>

          {/* 最近审核记录 */}
          {approvedApplications.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">最近手动批准的申请：</h4>
              <div className="space-y-1">
                {approvedApplications.slice(-5).map((addr, index) => (
                  <div key={index} className="text-xs text-green-600 font-mono">
                    ✅ {addr}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 平台设置区域 */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">⚙️ 平台设置</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                平台手续费率 (基点，100 = 1%)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={newFeeRate}
                  onChange={(e) => setNewFeeRate(e.target.value)}
                  placeholder="250"
                  min="0"
                  max="1000"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSetFeeRate}
                  disabled={isProcessing}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isProcessing
                      ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isProcessing ? '设置中...' : '设置费率'}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                当前输入: {newFeeRate} 基点 = {(parseInt(newFeeRate) / 100 || 0).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <h4 className="font-medium text-blue-800 mb-2">📖 使用说明</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>两种审核方式：</strong></p>
          <p>1. <strong>自动监控</strong>：页面会自动获取链上申请事件，点击"批准"按钮即可</p>
          <p>2. <strong>手动输入</strong>：如果自动监控没有显示，可以手动输入申请人地址</p>
          <br />
          <p><strong>审核流程：</strong></p>
          <p>• 用户在讲师页面提交申请</p>
          <p>• 申请事件记录在区块链上</p>
          <p>• 管理员在此页面审核申请</p>
          <p>• 审核通过后用户即可创建课程</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;