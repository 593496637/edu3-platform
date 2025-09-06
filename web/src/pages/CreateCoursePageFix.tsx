// CreateCoursePage.tsx 中需要修改的关键部分
// 请将以下代码替换到原有的 CreateCoursePage.tsx 中

// 1. 修改 handleCreateCourse 函数中的价格处理逻辑
const handleCreateCourse = async () => {
  if (!isConnected || !address) {
    setError('请先连接您的Web3钱包');
    return;
  }

  if (!validateFormData()) {
    setError('请修正表单中的错误后再提交');
    return;
  }

  try {
    setError(null);
    setStep('blockchain');
    
    // 修改这里：直接使用YD币价格，不需要ETH转换
    const priceInYD = parseFloat(formData.price);
    const priceInWei = parseUnits(priceInYD.toString(), 18); // YD代币有18位小数
    
    writeContract({
      address: CONTRACTS.CoursePlatform,
      abi: COURSE_PLATFORM_ABI,
      functionName: 'createCourse',
      args: [priceInWei], // 直接传入YD币价格的wei值
    });

  } catch (error) {
    console.error('创建课程失败:', error);
    setError('创建课程失败，请重试');
    setStep('form');
  }
};

// 2. 修改表单验证中的价格验证
const validateFormData = (): boolean => {
  const newErrors: { [key: string]: string } = {};

  // 修改价格验证
  if (!formData.price.trim()) {
    newErrors.price = '请输入课程价格';
  } else {
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      newErrors.price = '价格必须大于0';
    } else if (!Number.isInteger(price)) {
      newErrors.price = 'YD币价格必须是整数';
    } else if (price > 1000000) {
      newErrors.price = '价格不能超过1,000,000 YD币';
    }
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};