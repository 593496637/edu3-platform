import CourseList from "../components/CourseList";

export default function InstructorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">讲师中心</h1>
          <p className="mt-2 text-gray-600">
            申请成为讲师，创建和管理您的课程
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* 主要内容 */}
          <div className="lg:col-span-2">
            <CourseList />
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
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
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <h4 className="font-medium text-blue-800 mb-2">申请须知</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• 需要连接Web3钱包</p>
                <p>• 申请后等待管理员审核</p>
                <p>• 审核通过后即可创建课程</p>
                <p>• 课程创建需要支付Gas费用</p>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="font-medium text-gray-800 mb-2">课程创建流程</h4>
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">1</span>
                  <p>通过讲师认证</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">2</span>
                  <p>设置课程价格</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">3</span>
                  <p>链上创建课程</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">4</span>
                  <p>开始销售课程</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
