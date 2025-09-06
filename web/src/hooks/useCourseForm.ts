import { useState, useCallback } from 'react';
import { useFormValidation } from './useFormValidation';

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

const initialFormData: CourseFormData = {
  title: '',
  description: '',
  content: '',
  price: '',
  duration: '',
  difficulty: 'BEGINNER',
  category: 'Development',
  tags: [],
  requirements: [],
  objectives: [],
  thumbnail: '',
};

export const useCourseForm = () => {
  const [formData, setFormData] = useState<CourseFormData>(initialFormData);
  const { errors, validateForm, updateFieldError, clearErrors, setFormErrors } = useFormValidation();

  const handleInputChange = useCallback((field: keyof CourseFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 实时验证
    if (typeof value === 'string') {
      updateFieldError(field, value);
    }
  }, [updateFieldError]);

  const handleTagsChange = useCallback((tags: string[]) => {
    setFormData(prev => ({ ...prev, tags }));
  }, []);

  const handleRequirementsChange = useCallback((requirements: string[]) => {
    setFormData(prev => ({ ...prev, requirements }));
  }, []);

  const handleObjectivesChange = useCallback((objectives: string[]) => {
    setFormData(prev => ({ ...prev, objectives }));
  }, []);

  const validateFormData = useCallback(() => {
    const validation = validateForm(formData);
    setFormErrors(validation.errors);
    return validation.isValid;
  }, [formData, validateForm, setFormErrors]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    clearErrors();
  }, [clearErrors]);

  return {
    formData,
    errors,
    handleInputChange,
    handleTagsChange,
    handleRequirementsChange,
    handleObjectivesChange,
    validateFormData,
    resetForm,
    clearErrors
  };
};