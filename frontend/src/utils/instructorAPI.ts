// 最简单的API调用工具（学习用）

// 申请成为讲师（API部分）
export const applyInstructorAPI = async (address: string) => {
  try {
    console.log('📤 调用API申请讲师:', address)
    
    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address: address.toLowerCase(),
        isInstructor: false, // 先注册为普通用户
      })
    })

    const result = await response.json()
    console.log('📥 API响应:', result)
    
    if (result.success) {
      console.log('✅ API调用成功')
      return { success: true, data: result.data }
    } else {
      console.log('❌ API调用失败:', result.error)
      return { success: false, error: result.error }
    }
  } catch (error) {
    console.error('🚨 API请求异常:', error)
    return { success: false, error: '网络错误' }
  }
}

// 检查申请状态（简化版）
export const checkInstructorStatus = async (address: string) => {
  try {
    console.log('📤 检查讲师状态:', address)
    
    // 这里简化处理，实际项目中需要认证
    const response = await fetch(`/api/users/test-addresses`)
    const result = await response.json()
    
    if (result.success) {
      const instructors = result.data.instructors || []
      const isInstructor = instructors.some((inst: any) => 
        inst.address.toLowerCase() === address.toLowerCase()
      )
      
      console.log('📥 状态检查结果:', { isInstructor })
      return { isInstructor }
    }
    
    return { isInstructor: false }
  } catch (error) {
    console.error('🚨 状态检查失败:', error)
    return { isInstructor: false }
  }
}