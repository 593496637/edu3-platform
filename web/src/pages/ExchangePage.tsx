import TokenExchange from "../components/TokenExchange";

export default function ExchangePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">代币兑换</h1>
          <p className="mt-2 text-gray-600">
            将ETH兑换成YD代币来购买课程，或将YD代币兑换回ETH
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* 兑换组件 */}
          <div>
            <TokenExchange />
          </div>

          {/* 兑换说明 */}
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                兑换说明
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">1</span>
                  </div>
                  <p>1 ETH = 4000 YD代币（固定汇率）</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">2</span>
                  </div>
                  <p>最小兑换数量为0.001 ETH</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">3</span>
                  </div>
                  <p>兑换过程需要支付网络Gas费用</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">4</span>
                  </div>
                  <p>兑换交易确认后，代币将自动到账</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <h4 className="font-medium text-yellow-800 mb-2">温馨提示</h4>
              <p className="text-sm text-yellow-700">
                请确保您的钱包连接到Sepolia测试网，并有足够的测试ETH进行兑换。
                如需测试ETH，可以通过Sepolia水龙头获取。
              </p>
            </div>

            <div className="rounded-lg bg-green-50 border border-green-200 p-4">
              <h4 className="font-medium text-green-800 mb-2">使用场景</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p>• 购买课程：使用YD代币购买感兴趣的课程</p>
                <p>• 课程创作：讲师获得的YD代币可兑换回ETH</p>
                <p>• 平台生态：YD代币是平台的唯一交易媒介</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
