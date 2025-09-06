import React from 'react';

type CreationStep = 'form' | 'blockchain' | 'api' | 'success';

interface CreationProgressProps {
  step: CreationStep;
  hash?: `0x${string}`;
  onChainId?: number | null;
  error?: string | null;
}

export const CreationProgress: React.FC<CreationProgressProps> = ({
  step,
  hash,
  onChainId,
  error
}) => {
  const steps = [
    { key: 'form', label: '表单验证', description: '验证课程信息' },
    { key: 'blockchain', label: '区块链交易', description: '创建智能合约' },
    { key: 'api', label: '保存详情', description: '存储课程数据' },
    { key: 'success', label: '创建完成', description: '课程发布成功' }
  ];

  const getStepStatus = (stepKey: string) => {
    const stepIndex = steps.findIndex(s => s.key === stepKey);
    const currentIndex = steps.findIndex(s => s.key === step);
    
    if (error) {
      if (stepIndex <= currentIndex) {
        return stepIndex === currentIndex ? 'error' : 'completed';
      }
      return 'pending';
    }
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const getStepIcon = (stepKey: string) => {
    const status = getStepStatus(stepKey);
    
    switch (status) {
      case 'completed':
        return (
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'current':
        return (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-sm font-medium">
              {steps.findIndex(s => s.key === stepKey) + 1}
            </span>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">正在创建课程</h1>
          <p className="text-gray-600">请耐心等待，这可能需要几分钟时间</p>
        </div>

        {/* 进度条 */}
        <div className="space-y-4">
          {steps.map((stepItem, index) => (
            <div key={stepItem.key} className="flex items-center">
              {getStepIcon(stepItem.key)}
              
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-medium ${
                      getStepStatus(stepItem.key) === 'error' ? 'text-red-700' :
                      getStepStatus(stepItem.key) === 'current' ? 'text-blue-700' :
                      getStepStatus(stepItem.key) === 'completed' ? 'text-green-700' :
                      'text-gray-500'
                    }`}>
                      {stepItem.label}
                    </h3>
                    <p className="text-sm text-gray-500">{stepItem.description}</p>
                  </div>
                  
                  {getStepStatus(stepItem.key) === 'current' && (
                    <span className="text-blue-600 text-sm font-medium">进行中...</span>
                  )}
                  {getStepStatus(stepItem.key) === 'completed' && (
                    <span className="text-green-600 text-sm font-medium">已完成</span>
                  )}
                  {getStepStatus(stepItem.key) === 'error' && (
                    <span className="text-red-600 text-sm font-medium">失败</span>
                  )}
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`absolute left-4 mt-10 w-0.5 h-6 ${
                  getStepStatus(steps[index + 1].key) !== 'pending' ? 'bg-green-500' : 'bg-gray-300'
                }`} style={{ marginLeft: '15px' }} />
              )}
            </div>
          ))}
        </div>

        {/* 详细信息 */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          {hash && (
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-700">交易哈希: </span>
              <span className="text-sm text-blue-600 break-all">{hash}</span>
            </div>
          )}
          
          {onChainId && (
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-700">链上课程ID: </span>
              <span className="text-sm text-green-600">{onChainId}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {step === 'success' && (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-green-700 text-sm">
                🎉 课程创建成功！正在跳转到讲师中心...
              </p>
            </div>
          )}
        </div>

        {/* 提示信息 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>请不要关闭此页面，系统正在处理您的请求</p>
        </div>
      </div>
    </div>
  );
};
