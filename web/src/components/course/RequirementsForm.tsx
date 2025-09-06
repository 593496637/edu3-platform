import React, { useState } from 'react';

interface RequirementsFormProps {
  requirements: string[];
  onRequirementsChange: (requirements: string[]) => void;
}

export const RequirementsForm: React.FC<RequirementsFormProps> = ({ 
  requirements, 
  onRequirementsChange 
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddRequirement = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !requirements.includes(trimmedValue)) {
      onRequirementsChange([...requirements, trimmedValue]);
      setInputValue('');
    }
  };

  const handleRemoveRequirement = (index: number) => {
    const newRequirements = requirements.filter((_, i) => i !== index);
    onRequirementsChange(newRequirements);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddRequirement();
    }
  };

  const suggestionRequirements = [
    '基本的计算机操作知识',
    '了解基础编程概念',
    '具备HTML/CSS基础',
    '熟悉JavaScript语法',
    '了解区块链基本概念',
    '具备基础英语阅读能力',
    '有一定的数学基础',
    '了解网络基础知识',
    '具备逻辑思维能力',
    '有学习新技术的热情'
  ];

  const availableSuggestions = suggestionRequirements.filter(req => !requirements.includes(req));

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">学习要求</h2>
      <p className="text-gray-600 mb-4">列出学生学习本课程所需的先决条件和基础知识</p>
      
      <div className="space-y-4">
        {/* 添加要求输入 */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="输入学习要求，按回车添加"
            maxLength={100}
          />
          <button
            type="button"
            onClick={handleAddRequirement}
            disabled={!inputValue.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            添加
          </button>
        </div>

        {/* 当前要求列表 */}
        {requirements.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">学习要求：</h4>
            <div className="space-y-2">
              {requirements.map((requirement, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-2">•</span>
                    <span className="text-gray-800">{requirement}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveRequirement(index)}
                    className="text-red-600 hover:text-red-800 ml-2"
                    aria-label={`移除要求: ${requirement}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 建议要求 */}
        {availableSuggestions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">建议要求：</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {availableSuggestions.slice(0, 6).map((requirement) => (
                <button
                  key={requirement}
                  type="button"
                  onClick={() => onRequirementsChange([...requirements, requirement])}
                  className="text-left px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 border border-gray-300"
                >
                  + {requirement}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="text-sm text-gray-500 space-y-1">
          <p>• 明确列出学生需要具备的基础知识和技能</p>
          <p>• 这有助于学生判断是否适合学习此课程</p>
          <p>• 建议添加 3-6 个关键要求</p>
        </div>
      </div>
    </div>
  );
};
