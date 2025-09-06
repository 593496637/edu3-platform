import React from 'react';

interface CourseFormData {
  title: string;
  description: string;
  content: string;
  price: string;
  duration: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: string;
  thumbnail: string;
}

interface BasicInfoFormProps {
  formData: CourseFormData;
  onInputChange: (field: keyof CourseFormData, value: string) => void;
  categories: string[];
  errors: { [key: string]: string };
}

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  formData,
  onInputChange,
  categories,
  errors
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">基本信息</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            课程标题 * <span className="text-gray-500">(至少5个字符)</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => onInputChange('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="例如：区块链开发入门教程"
            required
            minLength={5}
          />
          {errors.title && (
            <p className="text-red-600 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            课程分类 *
          </label>
          <select
            value={formData.category}
            onChange={(e) => onInputChange('category', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            required
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-600 text-sm mt-1">{errors.category}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            课程价格 (ETH) * <span className="text-gray-500">(0.01-100 ETH)</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max="100"
            value={formData.price}
            onChange={(e) => onInputChange('price', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="0.1"
            required
          />
          {errors.price && (
            <p className="text-red-600 text-sm mt-1">{errors.price}</p>
          )}
          <p className="text-blue-600 text-sm mt-1">
            将按 1 ETH = 4000 YD 的汇率转换为 YD 币
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            课程时长
          </label>
          <input
            type="text"
            value={formData.duration}
            onChange={(e) => onInputChange('duration', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="例如: 20小时或10节课"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            难度等级
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) => onInputChange('difficulty', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="BEGINNER">初级</option>
            <option value="INTERMEDIATE">中级</option>
            <option value="ADVANCED">高级</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            课程缩略图URL
          </label>
          <input
            type="url"
            value={formData.thumbnail}
            onChange={(e) => onInputChange('thumbnail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          课程描述 * <span className="text-gray-500">(至少20个字符)</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="简要描述您的课程内容和特色，让学生了解课程价值"
          required
          minLength={20}
        />
        {errors.description && (
          <p className="text-red-600 text-sm mt-1">{errors.description}</p>
        )}
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          详细内容 * <span className="text-gray-500">(至少50个字符)</span>
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => onInputChange('content', e.target.value)}
          rows={6}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.content ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="详细描述课程内容、学习目标、课程大纲等。这将帮助学生更好地了解课程内容。"
          required
          minLength={50}
        />
        {errors.content && (
          <p className="text-red-600 text-sm mt-1">{errors.content}</p>
        )}
      </div>
    </div>
  );
};
