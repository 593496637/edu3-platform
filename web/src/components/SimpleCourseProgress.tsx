import React from 'react';

type CreationStep = 'form' | 'blockchain' | 'api' | 'success';

interface SimpleCourseProgressProps {
  step: CreationStep;
  hash?: `0x${string}`;
  onChainId?: number | null;
  error?: string | null;
  onRetry?: () => void;
}

export const SimpleCourseProgress: React.FC<SimpleCourseProgressProps> = ({
  step,
  hash,
  onChainId,
  error,
  onRetry
}) => {
  const LoadingSpinner = ({ color = 'blue' }: { color?: string }) => (
    <div className={`animate-spin rounded-full h-12 w-12 border-b-2 border-${color}-600 mx-auto mb-4`}></div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 'blockchain':
        return (
          <>
            <LoadingSpinner />
            <h3 className="text-lg font-semibold mb-2">正在区块链上创建课程...</h3>
            <p className="text-gray-600 mb-4">请在钱包中确认交易</p>
            {hash && (
              <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                交易哈希: {hash.slice(0, 10)}...{hash.slice(-8)}
              </div>
            )}
          </>
        );

      case 'api':
        return (
          <>
            <LoadingSpinner color="green" />
            <h3 className="text-lg font-semibold mb-2">保存课程详细信息...</h3>
            <p className="text-gray-600">正在将课程信息保存到数据库</p>
            {onChainId && (
              <p className="text-sm text-green-600 mt-2">
                ✅ 区块链课程ID: {onChainId}
              </p>
            )}
          </>
        );

      case 'success':
        return (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-lg font-semibold mb-2 text-green-600">课程创建成功！</h3>
            {onChainId && <p className="text-gray-600 mb-2">课程ID: {onChainId}</p>}
            <p className="text-sm text-gray-500">正在跳转到讲师中心...</p>
            <div className="mt-4">
              <div className="bg-green-100 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 text-sm">
                  🎯 您的课程已经成功发布！学生现在可以用YD币购买您的课程了。
                </p>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow text-center">
        {/* 进度条 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-500">创建进度</span>
            <span className="text-xs font-medium text-gray-500">
              {step === 'blockchain' && '1/3'}
              {step === 'api' && '2/3'}
              {step === 'success' && '3/3'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`bg-blue-600 h-2 rounded-full transition-all duration-500 ${
                step === 'blockchain' ? 'w-1/3' :
                step === 'api' ? 'w-2/3' :
                step === 'success' ? 'w-full' : 'w-0'
              }`}
            ></div>
          </div>
        </div>

        {renderStepContent()}

        {/* 错误处理 */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-600">
              <p className="font-medium">创建失败</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-3 w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                重试
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};