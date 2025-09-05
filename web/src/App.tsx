import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { config } from "./lib/wagmi";

// Components
import Header from "./components/Header";

// Pages
import HomePage from "./pages/HomePage";
import ExchangePage from "./pages/ExchangePage";
import InstructorPage from "./pages/InstructorPage";
import MyCoursesPage from "./pages/MyCoursesPage";
import ProfilePage from "./pages/ProfilePage";

import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Header />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/exchange" element={<ExchangePage />} />
                <Route path="/instructor" element={<InstructorPage />} />
                <Route path="/my-courses" element={<MyCoursesPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                {/* 预留课程相关路由 */}
                <Route path="/course/:id" element={<div className="p-8 text-center">课程详情页面 - 开发中</div>} />
                <Route path="/course/:id/buy" element={<div className="p-8 text-center">课程购买页面 - 开发中</div>} />
                <Route path="/course/:id/learn" element={<div className="p-8 text-center">课程学习页面 - 开发中</div>} />
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
            </div>
          </Router>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
