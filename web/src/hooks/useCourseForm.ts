import { useState } from 'react';
import { 
  validateCourseForm, 
  hasValidationErrors,
  type CourseFormData,
  type ValidationErrors 
} from '../utils/courseValidation';

export function useCourseForm() {
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    content: '',
    price: '',
    category: '',
    duration: '',
    difficulty: 'beginner',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleInputChange = (field: keyof CourseFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const validationErrors = validateCourseForm(formData);
    setErrors(validationErrors);
    return !hasValidationErrors(validationErrors);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      price: '',
      category: '',
      duration: '',
      difficulty: 'beginner',
    });
    setErrors({});
  };

  const clearErrors = () => {
    setErrors({});
  };

  return {
    formData,
    errors,
    handleInputChange,
    validateForm,
    resetForm,
    clearErrors,
  };
}