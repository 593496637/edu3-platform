import React from 'react';
import { useNavigate } from 'react-router-dom';

export const FormHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <button
        onClick={() => navigate('/instructor')}
        className="text-blue-600 hover:text-blue-800 mb-4 flex items-center space-x-2 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>返回讲师中心</span>
      </button>
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900">创建新课程</h1>
        <p className="text-gray-600 mt-2">
          填写课程信息，创建您的Web3教育课程。完整填写所有信息可以帮助学生更好地了解您的课程。
        </p>
      </div>
      
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-blue-800 font-medium mb-2">💡 创建提示</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 标题要简洁明了，能够概括课程主要内容</li>
          <li>• 描述要详细说明课程价值和学习收获</li>
          <li>• 合理定价，考虑课程内容的价值和目标学员群体</li>
          <li>• 添加相关标签有助于学员发现您的课程</li>
        </ul>
      </div>
    </div>
  );
};