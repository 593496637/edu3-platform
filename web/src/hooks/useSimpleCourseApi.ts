import { useState } from 'react';
import { SimpleCourseFormData } from './useSimpleCourseForm';

interface CreateCourseApiData extends SimpleCourseFormData {
  onChainId: number;
  instructorAddress: string;
}

export function useSimpleCourseApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCourse = async (data: CreateCourseApiData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title.trim(),
          description: data.description.trim(),
          content: data.content.trim(),
          price: data.price,
          category: data.category,
          onChainId: data.onChainId,
          instructorAddress: data.instructorAddress,
          // 设置默认值，保持与现有API兼容
          duration: '',
          difficulty: 'BEGINNER',
          tags: [],
          requirements: [],
          objectives: [],
          thumbnail: ''
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API请求失败: ${response.status}`);
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建课程失败';
      setError(errorMessage);
      console.error('API创建课程失败:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return { createCourse, isLoading, error, clearError };
}