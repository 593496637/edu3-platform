import React from 'react';
import type { CourseFormData, ValidationErrors } from '../utils/courseValidation';

interface CreateCourseFormProps {
  formData: CourseFormData;
  errors: ValidationErrors;
  categories: string[];
  onInputChange: (field: keyof CourseFormData, value: string) => void;
}

export default function CreateCourseForm({ 
  formData, 
  errors, 
  categories, 
  onInputChange 
}: CreateCourseFormProps) {
  return (
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
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="输入课程标题"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* 课程描述 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          课程描述 *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          rows={3}
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.description ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="简要描述您的课程内容和目标"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      {/* 课程内容 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          课程内容
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => onInputChange('content', e.target.value)}
          rows={6}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="详细的课程内容，支持Markdown格式"
        />
      </div>

      {/* 价格和分类 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            价格 (YD币) *
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => onInputChange('price', e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.price ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="例如: 100"
            min="0"
            step="1"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            分类 *
          </label>
          <select
            value={formData.category}
            onChange={(e) => onInputChange('category', e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.category ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">选择分类</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>
      </div>

      {/* 时长和难度 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            课程时长
          </label>
          <input
            type="text"
            value={formData.duration}
            onChange={(e) => onInputChange('duration', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例如: 2小时"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            难度等级
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) => onInputChange('difficulty', e.target.value as CourseFormData['difficulty'])}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="beginner">初级</option>
            <option value="intermediate">中级</option>
            <option value="advanced">高级</option>
          </select>
        </div>
      </div>
    </div>
  );
}