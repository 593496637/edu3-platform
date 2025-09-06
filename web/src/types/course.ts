// 简化的课程类型定义
export interface SimplifiedCourse {
  title: string;
  description: string;
  content: string;
  price: string; // YD币价格
  category: string;
}

// 创建课程API数据
export interface CreateCourseRequest extends SimplifiedCourse {
  onChainId: number;
  instructorAddress: string;
  // 兼容现有API的默认字段
  duration?: string;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  tags?: string[];
  requirements?: string[];
  objectives?: string[];
  thumbnail?: string;
}

// 创建步骤类型
export type CourseCreationStep = 'form' | 'blockchain' | 'api' | 'success';

// 课程分类
export const COURSE_CATEGORIES = [
  'Development',
  'Design', 
  'Business',
  'Security',
  'DeFi',
  'NFT'
] as const;

export type CourseCategory = typeof COURSE_CATEGORIES[number];