import { useAccount } from "wagmi";
import { BookOpen, ShoppingCart, Plus, Eye, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCourses, useBalance } from "../hooks/useApi";

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const { courses, isLoading: coursesLoading, error: coursesError, refetch } = useCourses();
  const { balanceFormatted, isLoading: balanceLoading } = useBalance(address);

  if (coursesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600">加载课程数据中...</p>
        </div>
      </div>
    );
  }

  if (coursesError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <BookOpen className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
          <p className="text-gray-500 mb-4">{coursesError}</p>
          <button
            onClick={() => refetch()}
            className="btn btn-primary"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">课程市场</h1>
          <p className="mt-2 text-gray-600">
            发现优质的Web3教育内容，使用YD代币购买课程
          </p>
          {isConnected && (
            <div className="mt-4 rounded-lg bg-blue-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">
                  您的YD代币余额: 
                </span>
                {balanceLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                ) : (
                  <span className="font-semibold text-blue-900">
                    {balanceFormatted} YD
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 统计信息 */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {courses.length}
                </p>
                <p className="text-gray-600">总课程数</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">0</p>
                <p className="text-gray-600">已购买课程</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <Plus className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">想成为讲师？</p>
                <Link
                  to="/instructor"
                  className="text-purple-600 hover:text-purple-800"
                >
                  申请成为讲师 →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 课程列表 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">全部课程</h2>
            <div className="text-sm text-gray-500">
              共 {courses.length} 门课程
            </div>
          </div>

          {courses.length === 0 ? (
            <div className="rounded-lg bg-white p-12 text-center shadow">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                暂无课程
              </h3>
              <p className="text-gray-500">
                还没有课程发布，成为第一个创建课程的讲师吧！
              </p>
              <Link
                to="/instructor"
                className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                成为讲师
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {course.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      {course.description}
                    </p>
                  </div>

                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">讲师</p>
                      <p className="text-sm font-medium text-gray-900">
                        {course.instructor_address.slice(0, 6)}...
                        {course.instructor_address.slice(-4)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">价格</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {course.priceformatted || (Number(course.price) / 1e18).toFixed(0)} YD
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Link
                      to={`/course/${course.chain_id}`}
                      className="flex flex-1 items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      查看详情
                    </Link>
                    <Link
                      to={`/course/${course.chain_id}/buy`}
                      className="flex flex-1 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      购买课程
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 快捷操作 */}
        {isConnected && (
          <div className="mt-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <h3 className="text-lg font-semibold">快速开始</h3>
            <p className="mt-2 text-blue-100">
              没有YD代币？先去兑换一些代币来购买课程
            </p>
            <Link
              to="/exchange"
              className="mt-4 inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-gray-50"
            >
              前往兑换代币 →
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
