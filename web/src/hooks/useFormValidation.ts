import { useState, useCallback } from 'react';

interface CourseFormData {
  title: string;
  description: string;
  content: string;
  price: string;
  duration: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: string;
  tags: string[];
  requirements: string[];
  objectives: string[];
  thumbnail: string;
}

interface ValidationErrors {
  [key: string]: string;
}

export const useFormValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = useCallback((field: keyof CourseFormData, value: any): string => {
    switch (field) {
      case 'title':
        if (!value || !value.trim()) {
          return '请输入课程标题';
        }
        if (value.length < 5) {
          return '课程标题至少需要5个字符';
        }
        return '';

      case 'description':
        if (!value || !value.trim()) {
          return '请输入课程描述';
        }
        if (value.length < 20) {
          return '课程描述至少需要20个字符';
        }
        return '';

      case 'content':
        if (!value || !value.trim()) {
          return '请输入课程内容';
        }
        if (value.length < 50) {
          return '课程内容至少需要50个字符';
        }
        return '';

      case 'price':
        if (!value || parseFloat(value) <= 0) {
          return '请输入有效的课程价格';
        }
        if (parseFloat(value) > 100) {
          return '课程价格不能超过100 ETH';
        }
        if (parseFloat(value) < 0.01) {
          return '课程价格不能少于0.01 ETH';
        }
        return '';

      case 'category':
        if (!value) {
          return '请选择课程分类';
        }
        return '';

      default:
        return '';
    }
  }, []);

  const validateForm = useCallback((formData: CourseFormData): { isValid: boolean; errors: ValidationErrors } => {
    const newErrors: ValidationErrors = {};

    // 验证必填字段
    const requiredFields: (keyof CourseFormData)[] = ['title', 'description', 'content', 'price', 'category'];
    
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  }, [validateField]);

  const updateFieldError = useCallback((field: string, value: any) => {
    const error = validateField(field as keyof CourseFormData, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }, [validateField]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setFormErrors = useCallback((newErrors: ValidationErrors) => {
    setErrors(newErrors);
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    updateFieldError,
    clearErrors,
    setFormErrors
  };
};