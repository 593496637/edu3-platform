# 课程创建简化和YD币定价修复

## 主要问题
1. **表单过于复杂** - 8个组件 → 简化为5个核心字段
2. **价格单位错误** - 显示ETH但应该用YD币

## 解决方案

### 方案1：使用全新简化版（推荐）
```
web/src/pages/SimplifiedCreateCoursePage.tsx
```
- 只有5个核心字段：标题、分类、价格、简介、详细内容
- 直接YD币定价
- 简洁的用户界面

### 方案2：修复现有代码
1. 替换 `BasicInfoForm.tsx` 为 `UpdatedBasicInfoForm.tsx`
2. 应用 `CreateCoursePageFix.tsx` 中的修复代码

## 关键修改
```typescript
// 旧（错误）
const priceInETH = parseFloat(formData.price);
const priceInYD = priceInETH * 4000;

// 新（正确）
const priceInYD = parseFloat(formData.price);
const priceInWei = parseUnits(priceInYD.toString(), 18);
```

## 用户体验改进
- 价格直接用YD币输入
- 添加汇率参考信息
- 简化表单字段
- 更清晰的创建流程