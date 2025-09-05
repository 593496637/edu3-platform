import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { config } from "./lib/wagmi";

// Components
import Header from "./components/Header";
import { GraphProvider } from "./components/GraphProvider";
import SimpleGraphTest from "./components/SimpleGraphTest"; // 🚀 简单测试页面

// Pages
import HomePage from "./pages/HomePage";
import ExchangePage from "./pages/ExchangePage";
import InstructorPage from "./pages/InstructorPage";
import MyCoursesPage from "./pages/MyCoursesPage";
import ProfilePage from "./pages/ProfilePage";
import CourseDetailPage from "./pages/CourseDetailPage";
import CourseLearnPage from "./pages/CourseLearnPage";

import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <GraphProvider>
            <Router>
              <div className="min-h-screen bg-gray-50">
                <Routes>
                  {/* 学习页面不显示Header (全屏学习体验) */}
                  <Route path="/course/:id/learn" element={<CourseLearnPage />} />
                  
                  {/* 🚀 简单测试页面 (全屏) */}
                  <Route path="/test" element={<SimpleGraphTest />} />
                  
                  {/* 其他页面都显示Header */}
                  <Route path="/*" element={
                    <>
                      <Header />
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/exchange" element={<ExchangePage />} />
                        <Route path="/instructor" element={<InstructorPage />} />
                        <Route path="/my-courses" element={<MyCoursesPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/course/:id" element={<CourseDetailPage />} />
                        <Route path="/course/:id/buy" element={<CourseDetailPage />} />
                        
                        {/* 简单演示页面 */}
                        <Route path="/demo" element={<div className="min-h-screen flex items-center justify-center">
                          <div className="text-center">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">Graph 优化演示</h1>
                            <p className="text-gray-600 mb-4">The Graph 查询优化已启用</p>
                            <div className="space-y-2 text-left max-w-md">
                              <div className="bg-green-100 p-3 rounded">✅ Apollo Client 已连接</div>
                              <div className="bg-blue-100 p-3 rounded">⚡ 查询性能优化已启用</div>
                              <div className="bg-yellow-100 p-3 rounded">🔄 智能缓存策略已配置</div>
                            </div>
                            <div className="mt-6 space-x-4">
                              <a href="/test" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                基础测试
                              </a>
                              <a href="/" className="text-blue-600 hover:text-blue-800">返回首页</a>
                            </div>
                          </div>
                        </div>} />
                        
                        {/* 404页面 */}
                        <Route path="*" element={
                          <div className="min-h-screen flex items-center justify-center">
                            <div className="text-center">
                              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                              <p className="text-gray-600 mb-4">页面未找到</p>
                              <a href="/" className="text-blue-600 hover:text-blue-800">返回首页</a>
                            </div>
                          </div>
                        } />
                      </Routes>
                    </>
                  } />
                </Routes>
              </div>
            </Router>
          </GraphProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
