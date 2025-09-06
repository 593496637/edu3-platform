import React from 'react';
import { useAccount } from 'wagmi';
import { useInstructorApplication } from '../hooks/useInstructorApplication';

const InstructorApplication: React.FC = () => {
  const { isConnected } = useAccount();
  const {
    isInstructor,
    hasApplied,
    isApplying,
    error,
    applyToBeInstructor,
  } = useInstructorApplication();

  // 渲染不同状态的按钮和信息
  const renderApplicationStatus = () => {
    if (!isConnected) {
      return (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <p className="text-yellow-800 text-sm">
            请先连接您的Web3钱包以申请成为讲师
          </p>
        </div>
      );
    }

    if (isInstructor) {
      return (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <h4 className="font-medium text-green-800 mb-2">🎉 恭喜！您已经是认证讲师</h4>
          <p className="text-green-700 text-sm">
            您现在可以创建和发布付费课程了
          </p>
          <button className="mt-3 bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors">
            开始创建课程
          </button>
        </div>
      );
    }

    if (hasApplied) {
      return (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <h4 className="font-medium text-blue-800 mb-2">⏳ 申请已提交</h4>
          <p className="text-blue-700 text-sm">
            您的讲师申请正在审核中，请耐心等待管理员审核通过。
          </p>
          <div className="mt-3 text-xs text-blue-600">
            审核通常在24-48小时内完成
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-lg bg-white border border-gray-200 p-6">
        <h4 className="font-medium text-gray-900 mb-3">申请成为讲师</h4>
        <p className="text-gray-600 text-sm mb-4">
          成为认证讲师后，您可以创建付费课程并获得YD代币收益
        </p>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={applyToBeInstructor}
          disabled={isApplying}
          className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            isApplying
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isApplying ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              处理中...
            </span>
          ) : (
            '申请成为讲师'
          )}
        </button>

        <div className="mt-4 text-xs text-gray-500">
          <p>• 申请需要支付少量Gas费用</p>
          <p>• 申请提交后无法撤销</p>
          <p>• 审核通过后即可开始创建课程</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderApplicationStatus()}
    </div>
  );
};

export default InstructorApplication;