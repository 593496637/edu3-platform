import React from 'react';
import { useNavigate } from 'react-router-dom';
import CourseList from "../components/CourseList";
import InstructorApplication from "../components/InstructorApplication";
import { useInstructorApplication } from "../hooks/useInstructorApplication";

export default function InstructorPage() {
  const { isInstructor } = useInstructorApplication();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">讲师中心</h1>
          <p className="mt-2 text-gray-600">
            {isInstructor ? '管理您的课程和收益' : '申请成为讲师，创建和管理您的课程'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* 主要内容 */}
          <div className="lg:col-span-2">
            {isInstructor ? (
              <div className="space-y-6">
                {/* 讲师操作栏 */}
                <div className="rounded-lg bg-white p-6 shadow">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">课程管理</h2>
                    <button
                      onClick={() => navigate('/create-course')}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <span>+</span>
                      <span>创建新课程</span>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-900">总课程数</h3>
                      <p className="text-2xl font-bold text-blue-600">0</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-medium text-green-900">总收益</h3>
                      <p className="text-2xl font-bold text-green-600">0 YD</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-medium text-purple-900">学生数</h3>
                      <p className="text-2xl font-bold text-purple-600">0</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">我的课程</h2>
                  <CourseList />
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">成为讲师</h2>
                <p className="text-gray-600 mb-6">
                  通过EDU3平台分享您的知识，获得YD代币收益。我们的平台基于区块链技术，
                  确保收益分配的透明性和公平性。
                </p>
                <InstructorApplication />
              </div>
            )}
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 讲师权益 */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                讲师权益
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <p>创建和发布付费课程</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <p>获得YD代币收益</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <p>自由设定课程价格</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <p>链上透明的收益分配</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <p>平台仅收取2.5%手续费</p>
                </div>
              </div>
            </div>

            {/* 快速操作 */}
            {isInstructor && (
              <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 p-6">
                <h4 className="font-medium text-blue-900 mb-4">快速操作</h4>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/create-course')}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    创建新课程
                  </button>
                  <button
                    onClick={() => navigate('/my-courses')}
                    className="w-full bg-white text-blue-600 border border-blue-300 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    查看我的课程
                  </button>
                  <button
                    onClick={() => navigate('/exchange')}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    兑换收益
                  </button>
                </div>
              </div>
            )}

            {/* 申请须知或创建课程指南 */}
            {!isInstructor ? (
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <h4 className="font-medium text-blue-800 mb-2">申请须知</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• 需要连接Web3钱包</p>
                  <p>• 申请后等待管理员审核</p>
                  <p>• 审核通过后即可创建课程</p>
                  <p>• 课程创建需要支付Gas费用</p>
                  <p>• 申请过程完全在链上进行</p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                <h4 className="font-medium text-yellow-800 mb-2">创建课程指南</h4>
                <div className="text-sm text-yellow-700 space-y-1">
                  <p>• 设置合理的课程价格</p>
                  <p>• 准备高质量的课程内容</p>
                  <p>• 添加详细的课程描述</p>
                  <p>• 创建课程需要Gas费用</p>
                  <p>• 课程信息存储在区块链上</p>
                </div>
              </div>
            )}

            {/* 收益管理 */}
            {isInstructor && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                <h4 className="font-medium text-green-800 mb-2">收益管理</h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p>• YD代币自动到账</p>
                  <p>• 可随时兑换为ETH</p>
                  <p>• 支持AAVE质押获利(选修)</p>
                  <p>• 收益完全透明可查</p>
                </div>
              </div>
            )}

            {/* 流程指南 */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="font-medium text-gray-800 mb-2">
                {isInstructor ? '课程管理流程' : '成为讲师流程'}
              </h4>
              <div className="text-sm text-gray-600 space-y-2">
                {isInstructor ? (
                  <>
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">1</span>
                      <p>点击"创建新课程"按钮</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">2</span>
                      <p>填写课程详细信息</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">3</span>
                      <p>链上创建课程记录</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">4</span>
                      <p>等待学生购买并获得收益</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">1</span>
                      <p>连接Web3钱包</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">2</span>
                      <p>提交讲师申请</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">3</span>
                      <p>等待管理员审核</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">4</span>
                      <p>开始创建课程</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
