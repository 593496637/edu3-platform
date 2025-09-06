import React from 'react';
import { SimpleCourseFormData } from '../hooks/useSimpleCourseForm';

interface SimpleCourseFormProps {
  formData: SimpleCourseFormData;
  onInputChange: (field: keyof SimpleCourseFormData, value: string) => void;
  errors: { [key: string]: string };
  categories: string[];
}

export const SimpleCourseForm: React.FC<SimpleCourseFormProps> = ({
  formData,
  onInputChange,
  errors,
  categories
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="space-y-6">
        {/* 课程标题 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            课程标题 *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => onInputChange('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="例如：区块链开发入门教程"
          />
          {errors.title && (
            <p className="text-red-600 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* 分类和价格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            >
              <option value="">请选择分类</option>
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
              课程价格 (YD币) *
            </label>
            <input
              type="number"
              step="1"
              min="1"
              value={formData.price}
              onChange={(e) => onInputChange('price', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="1000"
            />
            {errors.price && (
              <p className="text-red-600 text-sm mt-1">{errors.price}</p>
            )}
          </div>
        </div>

        {/* 价格说明 */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-blue-800 text-sm">
            💡 <strong>关于定价：</strong>学生需要用YD币购买课程。他们可以在兑换页面用ETH兑换YD币 (1 ETH = 4000 YD)
          </p>
        </div>

        {/* 课程简介 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            课程简介 *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => onInputChange('description', e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="简要描述您的课程内容和特色"
          />
          {errors.description && (
            <p className="text-red-600 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* 详细内容 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            课程详细内容 *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => onInputChange('content', e.target.value)}
            rows={6}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.content ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="详细描述课程内容、学习目标、课程大纲等"
          />
          {errors.content && (
            <p className="text-red-600 text-sm mt-1">{errors.content}</p>
          )}
        </div>
      </div>
    </div>
  );
};