import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { config } from "./lib/wagmi";
import Header from "./components/Header";
import TokenExchange from "./components/TokenExchange";
import CourseList from "./components/CourseList";

import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* 左侧：代币兑换 */}
                <div className="space-y-6">
                  <TokenExchange />
                </div>

                {/* 右侧：课程列表 */}
                <div className="space-y-6">
                  <CourseList />
                </div>
              </div>
            </main>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
