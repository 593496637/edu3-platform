import React from 'react';

interface SimpleWalletPromptProps {
  title?: string;
  description?: string;
  showInstructorNote?: boolean;
}

export const SimpleWalletPrompt: React.FC<SimpleWalletPromptProps> = ({
  title = "创建课程",
  description = "请先连接您的Web3钱包以创建课程",
  showInstructorNote = true
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
        <div className="text-center">
          <div className="text-6xl mb-4">🦊</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-gray-600 mb-6">{description}</p>
          
          {showInstructorNote && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                💡 <strong>提醒：</strong>只有认证讲师才能创建课程。如果您还不是讲师，请先申请成为讲师。
              </p>
            </div>
          )}
          
          <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">需要准备：</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• MetaMask 或其他Web3钱包</li>
              <li>• 少量ETH用于支付Gas费</li>
              <li>• 确保连接到正确的网络</li>
            </ul>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              请点击页面右上角的"连接钱包"按钮
            </p>
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <span className="text-sm">→</span>
              <span className="text-sm font-medium">连接钱包</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};