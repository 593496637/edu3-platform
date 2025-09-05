import { useAccount, useReadContract } from "wagmi";
import { BookOpen, CheckCircle, Clock, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { CONTRACTS, COURSE_PLATFORM_ABI } from "../lib/contracts";

export default function MyCoursesPage() {
  const { address, isConnected } = useAccount();

  // 获取用户购买的课程 - 这里需要后续通过后端API或The Graph查询
  // 目前使用模拟数据
  const purchasedCourses = [
    {
      id: 1,
      title: "Web3开发基础",
      instructor: "0x1234...5678",
      purchaseDate: "2024-01-15",
      progress: 75,
      totalLessons: 12,
      completedLessons: 9,
      thumbnail: "/api/placeholder/300/200"
    },
    {
      id: 2,
      title: "智能合约开发进阶",
      instructor: "0x5678...9012",
      purchaseDate: "2024-01-20",
      progress: 30,
      totalLessons: 15,
      completedLessons: 4,
      thumbnail: "/api/placeholder/300/200"
    }
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              请先连接钱包
            </h3>
            <p className="mt-1 text-gray-500">
              连接钱包后查看您购买的课程
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">我的课程</h1>
          <p className="mt-2 text-gray-600">
            查看您购买的课程，继续学习进度
          </p>
        </div>

        {/* 学习统计 */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {purchasedCourses.length}
                </p>
                <p className="text-gray-600">已购买课程</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {purchasedCourses.reduce((acc, course) => acc + course.completedLessons, 0)}
                </p>
                <p className="text-gray-600">已完成课时</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {Math.round(purchasedCourses.reduce((acc, course) => acc + course.progress, 0) / purchasedCourses.length) || 0}%
                </p>
                <p className="text-gray-600">平均进度</p>
              </div>
            </div>
          </div>
        </div>

        {/* 课程列表 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">我的课程</h2>
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              浏览更多课程 →
            </Link>
          </div>

          {purchasedCourses.length === 0 ? (
            <div className="rounded-lg bg-white p-12 text-center shadow">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                还没有购买任何课程
              </h3>
              <p className="text-gray-500 mb-4">
                去课程市场发现感兴趣的课程吧！
              </p>
              <Link
                to="/"
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                浏览课程
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {purchasedCourses.map((course) => (
                <div
                  key={course.id}
                  className="rounded-lg bg-white shadow hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* 课程缩略图 */}
                  <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <Play className="h-12 w-12 text-white" />
                  </div>

                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        讲师: {course.instructor}
                      </p>
                      <p className="text-sm text-gray-500">
                        购买日期: {course.purchaseDate}
                      </p>
                    </div>

                    {/* 学习进度 */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          学习进度
                        </span>
                        <span className="text-sm text-gray-500">
                          {course.completedLessons}/{course.totalLessons} 课时
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-right mt-1">
                        <span className="text-sm text-blue-600 font-medium">
                          {course.progress}%
                        </span>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="space-y-2">
                      <Link
                        to={`/course/${course.id}/learn`}
                        className="w-full flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        继续学习
                      </Link>
                      <Link
                        to={`/course/${course.id}`}
                        className="w-full flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        查看详情
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 学习建议 */}
        {purchasedCourses.length > 0 && (
          <div className="mt-12 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">学习建议</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <p>每天坚持学习30分钟，保持学习习惯</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <p>完成课程作业，加深理解</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <p>记录学习笔记，方便复习</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <p>实践课程项目，提升实战能力</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
