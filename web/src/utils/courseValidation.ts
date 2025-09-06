// 课程表单验证工具函数
export interface CourseFormData {
  title: string;
  description: string;
  content: string;
  price: string;
  category: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface ValidationErrors {
  [key: string]: string;
}

export const validateCourseForm = (formData: CourseFormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  // 标题验证
  if (!formData.title.trim()) {
    errors.title = '请输入课程标题';
  } else if (formData.title.length < 5) {
    errors.title = '课程标题至少需要5个字符';
  } else if (formData.title.length > 100) {
    errors.title = '课程标题不能超过100个字符';
  }

  // 描述验证
  if (!formData.description.trim()) {
    errors.description = '请输入课程描述';
  } else if (formData.description.length < 20) {
    errors.description = '课程描述至少需要20个字符';
  } else if (formData.description.length > 500) {
    errors.description = '课程描述不能超过500个字符';
  }

  // 价格验证
  if (!formData.price.trim()) {
    errors.price = '请输入课程价格';
  } else {
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      errors.price = '价格必须大于0';
    } else if (!Number.isInteger(price)) {
      errors.price = 'YD币价格必须是整数';
    } else if (price > 1000000) {
      errors.price = '价格不能超过1,000,000 YD币';
    }
  }

  // 分类验证
  if (!formData.category) {
    errors.category = '请选择课程分类';
  }

  return errors;
};

export const hasValidationErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};