import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import { CONTRACTS, YD_TOKEN_ABI } from "../lib/contracts";
import { formatYDToken } from "../lib/utils";

export default function Header() {
  const { address, isConnected } = useAccount();

  // 获取YD代币余额
  const { data: ydBalance } = useReadContract({
    address: CONTRACTS.YDToken,
    abi: YD_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-primary-600 flex h-10 w-10 items-center justify-center rounded-lg">
              <span className="text-lg font-bold text-white">E3</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">EDU3</h1>
              <p className="text-sm text-gray-500">Web3大学</p>
            </div>
          </div>

          {/* 用户信息和连接按钮 */}
          <div className="flex items-center space-x-4">
            {isConnected && ydBalance !== undefined && (
              <div className="rounded-lg bg-gray-100 px-4 py-2">
                <div className="text-sm text-gray-600">YD余额</div>
                <div className="text-primary-600 font-semibold">
                  {formatYDToken(ydBalance)} YD
                </div>
              </div>
            )}

            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}
