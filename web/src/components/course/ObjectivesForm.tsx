import React, { useState } from 'react';

interface ObjectivesFormProps {
  objectives: string[];
  onObjectivesChange: (objectives: string[]) => void;
}

export const ObjectivesForm: React.FC<ObjectivesFormProps> = ({ 
  objectives, 
  onObjectivesChange 
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddObjective = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !objectives.includes(trimmedValue)) {
      onObjectivesChange([...objectives, trimmedValue]);
      setInputValue('');
    }
  };

  const handleRemoveObjective = (index: number) => {
    const newObjectives = objectives.filter((_, i) => i !== index);
    onObjectivesChange(newObjectives);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddObjective();
    }
  };

  const suggestionObjectives = [
    '掌握区块链的基本概念和原理',
    '学会编写智能合约',
    '了解DeFi协议的工作原理',
    '掌握Web3开发技能',
    '学会使用开发工具和框架',
    '理解加密货币和代币经济',
    '掌握前端开发技术',
    '学会数据库设计和操作',
    '了解网络安全最佳实践',
    '培养项目管理能力'
  ];

  const availableSuggestions = suggestionObjectives.filter(obj => !objectives.includes(obj));

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">学习目标</h2>
      <p className="text-gray-600 mb-4">明确学生完成课程后将获得的知识和技能</p>
      
      <div className="space-y-4">
        {/* 添加目标输入 */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="输入学习目标，按回车添加"
            maxLength={120}
          />
          <button
            type="button"
            onClick={handleAddObjective}
            disabled={!inputValue.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            添加
          </button>
        </div>

        {/* 当前目标列表 */}
        {objectives.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">学习目标：</h4>
            <div className="space-y-2">
              {objectives.map((objective, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-800">{objective}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveObjective(index)}
                    className="text-red-600 hover:text-red-800 ml-2"
                    aria-label={`移除目标: ${objective}`}
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

        {/* 建议目标 */}
        {availableSuggestions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">建议目标：</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {availableSuggestions.slice(0, 6).map((objective) => (
                <button
                  key={objective}
                  type="button"
                  onClick={() => onObjectivesChange([...objectives, objective])}
                  className="text-left px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 border border-gray-300"
                >
                  + {objective}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="text-sm text-gray-500 space-y-1">
          <p>• 描述学生完成课程后将掌握的具体技能</p>
          <p>• 使用具体、可衡量的表述方式</p>
          <p>• 建议设定 4-8 个明确的学习目标</p>
          <p>• 目标应该与课程难度和时长相匹配</p>
        </div>
      </div>
    </div>
  );
};
