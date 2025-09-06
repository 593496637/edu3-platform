import React, { useState } from 'react';

interface TagsFormProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

export const TagsForm: React.FC<TagsFormProps> = ({ tags, onTagsChange }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      onTagsChange([...tags, trimmedValue]);
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const suggestedTags = [
    'JavaScript', 'React', 'Solidity', 'Web3', 'DeFi', 'NFT', 'Smart Contracts',
    'Blockchain', 'Ethereum', 'Node.js', 'TypeScript', 'CSS', 'HTML', 'API',
    'Frontend', 'Backend', 'Database', 'Security', 'Testing', 'DevOps'
  ];

  const availableSuggestions = suggestedTags.filter(tag => !tags.includes(tag));

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">课程标签</h2>
      <p className="text-gray-600 mb-4">添加相关标签帮助学生发现您的课程</p>
      
      <div className="space-y-4">
        {/* 添加标签输入 */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="输入标签名称，按回车添加"
            maxLength={20}
          />
          <button
            type="button"
            onClick={handleAddTag}
            disabled={!inputValue.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            添加
          </button>
        </div>

        {/* 当前标签列表 */}
        {tags.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">已添加标签：</h4>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                    aria-label={`移除标签 ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 建议标签 */}
        {availableSuggestions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">建议标签：</h4>
            <div className="flex flex-wrap gap-2">
              {availableSuggestions.slice(0, 10).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onTagsChange([...tags, tag])}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 border border-gray-300"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="text-sm text-gray-500">
          建议添加 3-8 个相关标签，每个标签最多 20 个字符
        </p>
      </div>
    </div>
  );
};
