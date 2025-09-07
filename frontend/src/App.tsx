import { useState } from "react";
import "./App.css";
import { WalletConnect } from "./components/WalletConnect";
import { CourseList } from "./components/CourseList";
import { CreateCourse } from "./components/CreateCourse";
import { TokenExchange } from "./components/TokenExchange";
import { UserProfile } from "./components/UserProfile";
import { CoursePurchase } from "./components/CoursePurchase";
import { AdminPanel } from "./components/AdminPanel";
import { InstructorApplication } from "./components/InstructorApplication";

type Page = "courses" | "create" | "exchange" | "profile" | "instructor" | "admin";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("courses");
  const [showPurchaseModal, setShowPurchaseModal] = useState<number | null>(
    null
  );

  const handlePurchaseCourse = (courseId: number) => {
    setShowPurchaseModal(courseId);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "courses":
        return <CourseList onPurchaseCourse={handlePurchaseCourse} />;
      case "create":
        return <CreateCourse />;
      case "exchange":
        return <TokenExchange />;
      case "profile":
        return <UserProfile />;
      case "instructor":
        return <InstructorApplication />;
      case "admin":
        return <AdminPanel />;
      default:
        return <CourseList onPurchaseCourse={handlePurchaseCourse} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Edu3</h1>
              <span className="ml-2 text-gray-500 text-sm">Web3大学</span>
            </div>

            {/* 导航菜单 */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => setCurrentPage("courses")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  currentPage === "courses"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                课程列表
              </button>
              <button
                onClick={() => setCurrentPage("create")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  currentPage === "create"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                创建课程
              </button>
              <button
                onClick={() => setCurrentPage("exchange")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  currentPage === "exchange"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                代币兑换
              </button>
              <button
                onClick={() => setCurrentPage("instructor")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  currentPage === "instructor"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                申请讲师
              </button>
              <button
                onClick={() => setCurrentPage("profile")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  currentPage === "profile"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                用户中心
              </button>
              <button
                onClick={() => setCurrentPage("admin")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  currentPage === "admin"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                管理员
              </button>
            </div>

            {/* 钱包连接 */}
            <WalletConnect />
          </div>
        </div>

        {/* 移动端导航菜单 */}
        <div className="md:hidden border-t bg-gray-50">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button
              onClick={() => setCurrentPage("courses")}
              className={`block px-3 py-2 text-base font-medium w-full text-left transition-colors ${
                currentPage === "courses"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700"
              }`}
            >
              课程列表
            </button>
            <button
              onClick={() => setCurrentPage("create")}
              className={`block px-3 py-2 text-base font-medium w-full text-left transition-colors ${
                currentPage === "create"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700"
              }`}
            >
              创建课程
            </button>
            <button
              onClick={() => setCurrentPage("exchange")}
              className={`block px-3 py-2 text-base font-medium w-full text-left transition-colors ${
                currentPage === "exchange"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700"
              }`}
            >
              代币兑换
            </button>
            <button
              onClick={() => setCurrentPage("instructor")}
              className={`block px-3 py-2 text-base font-medium w-full text-left transition-colors ${
                currentPage === "instructor"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700"
              }`}
            >
              申请讲师
            </button>
            <button
              onClick={() => setCurrentPage("profile")}
              className={`block px-3 py-2 text-base font-medium w-full text-left transition-colors ${
                currentPage === "profile"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700"
              }`}
            >
              用户中心
            </button>
            <button
              onClick={() => setCurrentPage("admin")}
              className={`block px-3 py-2 text-base font-medium w-full text-left transition-colors ${
                currentPage === "admin"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700"
              }`}
            >
              管理员
            </button>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <main className="py-8">{renderPage()}</main>

      {/* 购买课程模态框 */}
      {showPurchaseModal && (
        <CoursePurchase
          courseId={showPurchaseModal}
          onClose={() => setShowPurchaseModal(null)}
          onSuccess={() => {
            setShowPurchaseModal(null);
            // 可以在这里刷新课程列表或显示成功消息
          }}
        />
      )}

    </div>
  );
}

export default App;
