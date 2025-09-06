import React from 'react';

interface SubmitSectionProps {
  isLoading: boolean;
  onSubmit: () => void;
}

export const SubmitSection: React.FC<SubmitSectionProps> = ({ isLoading, onSubmit }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="border-t border-gray-200 pt-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-2">准备发布课程</h3>
            <p className="text-gray-600 text-sm">
              请确认所有信息无误后点击创建课程。课程将在区块链上创建并保存详细信息。
            </p>
            <div className="mt-3 text-sm text-blue-600 space-y-1">
              <p>• 创建课程需要支付少量 gas 费用</p>
              <p>• 课程一旦创建无法删除，但可以编辑</p>
              <p>• 课程将立即对学生可见</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onClick={() => window.history.back()}
              disabled={isLoading}
            >
              取消
            </button>
            
            <button
              type="submit"
              onClick={onSubmit}
              disabled={isLoading}
              className={`px-8 py-2 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isLoading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  创建中...
                </div>
              ) : (
                '创建课程'
              )}
            </button>
          </div>
        </div>

        {/* 预览信息卡片 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">发布须知：</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="space-y-1">
              <p>✓ 确保课程内容真实有效</p>
              <p>✓ 价格设置合理</p>
              <p>✓ 标签和分类准确</p>
            </div>
            <div className="space-y-1">
              <p>✓ 学习目标明确可达成</p>
              <p>✓ 先决条件描述清晰</p>
              <p>✓ 课程描述吸引人</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
