import React from 'react';
import { useNavigate } from 'react-router-dom';

export const WalletConnectionPrompt: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">连接钱包以创建课程</h2>
          <p className="text-gray-600 mb-6">
            创建课程需要Web3钱包来进行区块链交易。请先连接您的MetaMask或其他兼容钱包。
          </p>
        </div>
        
        <div className="space-y-3">
          <button 
            onClick={() => navigate('/instructor')}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            返回讲师中心
          </button>
          <p className="text-sm text-gray-500">
            在讲师中心页面可以连接钱包
          </p>
        </div>
      </div>
    </div>
  );
};