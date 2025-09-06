import { useState } from 'react';

// 简化的课程表单数据类型
export interface SimpleCourseFormData {
  title: string;
  description: string;
  content: string;
  price: string; // 以YD币为单位
  category: string;
}

// 简化版表单钩子
export function useSimpleCourseForm() {
  const [formData, setFormData] = useState<SimpleCourseFormData>({
    title: '',
    description: '',
    content: '',
    price: '',
    category: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 处理输入变化
  const handleInputChange = (field: keyof SimpleCourseFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = '请输入课程标题';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = '标题至少需要5个字符';
    }

    if (!formData.category) {
      newErrors.category = '请选择课程分类';
    }

    if (!formData.price.trim()) {
      newErrors.price = '请输入课程价格';
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = '价格必须大于0';
      } else if (!Number.isInteger(price)) {
        newErrors.price = 'YD币价格必须是整数';
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = '请输入课程简介';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = '简介至少需要10个字符';
    }

    if (!formData.content.trim()) {
      newErrors.content = '请输入课程详细内容';
    } else if (formData.content.trim().length < 20) {
      newErrors.content = '详细内容至少需要20个字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearErrors = () => setErrors({});
  const resetForm = () => {
    setFormData({ title: '', description: '', content: '', price: '', category: '' });
    setErrors({});
  };

  return {
    formData,
    errors,
    handleInputChange,
    validateForm,
    clearErrors,
    resetForm
  };
}