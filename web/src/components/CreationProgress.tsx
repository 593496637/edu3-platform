import React from 'react';

type CreationStep = 'form' | 'blockchain' | 'success';

interface CreationProgressProps {
  step: CreationStep;
  isWritePending: boolean;
  isConfirming: boolean;
  isApiLoading: boolean;
  hash?: `0x${string}`;
  error?: string | null;
  onRetry?: () => void;
}

export default function CreationProgress({
  step,
  isWritePending,
  isConfirming,
  isApiLoading,
  hash,
  error,
  onRetry
}: CreationProgressProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        {step === 'blockchain' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">创建中...</h2>
            <p className="text-gray-600 mb-4">
              {isWritePending && '正在发送交易...'}
              {isConfirming && '等待区块链确认...'}
              {isApiLoading && '保存课程信息...'}
            </p>
            {hash && (
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-blue-600 font-medium mb-1">交易哈希:</p>
                <p className="text-xs text-blue-800 break-all font-mono">{hash}</p>
              </div>
            )}
          </>
        )}
        
        {step === 'success' && (
          <>
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">创建成功！</h2>
            <p className="text-gray-600 mb-4">
              您的课程已成功创建，即将跳转到讲师中心...
            </p>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-700">
                课程已上链并保存，学生现在可以购买您的课程了！
              </p>
            </div>
          </>
        )}
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <div className="text-red-600 mr-3">⚠️</div>
              <div className="text-left">
                <h3 className="text-red-800 font-medium">创建失败</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="mt-3 text-sm bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                  >
                    重试
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}