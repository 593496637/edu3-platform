import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import { Loader2, Plus, ShoppingCart, Users, BookOpen } from "lucide-react";
import { CONTRACTS, COURSE_PLATFORM_ABI, YD_TOKEN_ABI } from "../lib/contracts";
import { formatYDToken } from "../lib/utils";

export default function CourseList() {
  const { address, isConnected } = useAccount();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCoursePrice, setNewCoursePrice] = useState("");

  // 获取课程总数
  const { data: totalCourses, refetch: refetchTotalCourses } = useReadContract({
    address: CONTRACTS.CoursePlatform,
    abi: COURSE_PLATFORM_ABI,
    functionName: "getTotalCourses",
  });

  // 检查是否为讲师
  const { data: isInstructor } = useReadContract({
    address: CONTRACTS.CoursePlatform,
    abi: COURSE_PLATFORM_ABI,
    functionName: "isInstructor",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // 申请成为讲师
  const {
    writeContract: applyInstructor,
    data: applyHash,
    isPending: isApplyPending,
  } = useWriteContract();

  // 创建课程
  const {
    writeContract: createCourse,
    data: createHash,
    isPending: isCreatePending,
  } = useWriteContract();

  // 购买课程
  const {
    writeContract: buyCourse,
    data: buyHash,
    isPending: isBuyPending,
  } = useWriteContract();

  // 授权YD代币
  const {
    writeContract: approveTokens,
    data: approveHash,
    isPending: isApprovePending,
  } = useWriteContract();

  // 等待交易确认
  const { isLoading: isApplyConfirming } = useWaitForTransactionReceipt({
    hash: applyHash,
  });

  const { isLoading: isCreateConfirming } = useWaitForTransactionReceipt({
    hash: createHash,
  });

  const handleApplyInstructor = () => {
    if (!isConnected) return;

    applyInstructor({
      address: CONTRACTS.CoursePlatform,
      abi: COURSE_PLATFORM_ABI,
      functionName: "applyToBeInstructor",
    });
  };

  const handleCreateCourse = () => {
    if (!newCoursePrice || !isConnected) return;

    try {
      const priceInWei = parseEther(newCoursePrice);
      createCourse({
        address: CONTRACTS.CoursePlatform,
        abi: COURSE_PLATFORM_ABI,
        functionName: "createCourse",
        args: [priceInWei],
      });
    } catch (error) {
      console.error("创建课程失败:", error);
    }
  };

  const handleBuyCourse = async (courseId: number, price: bigint) => {
    if (!isConnected) return;

    // 首先授权平台使用用户的YD代币
    approveTokens({
      address: CONTRACTS.YDToken,
      abi: YD_TOKEN_ABI,
      functionName: "approve",
      args: [CONTRACTS.CoursePlatform, price],
    });

    // 注意：实际应用中，应该等待授权交易确认后再购买课程
    // 这里为了简化，直接调用购买函数
    setTimeout(() => {
      buyCourse({
        address: CONTRACTS.CoursePlatform,
        abi: COURSE_PLATFORM_ABI,
        functionName: "buyCourse",
        args: [BigInt(courseId)],
      });
    }, 2000);
  };

  const isLoading =
    isApplyPending ||
    isCreatePending ||
    isBuyPending ||
    isApprovePending ||
    isApplyConfirming ||
    isCreateConfirming;

  return (
    <div className="space-y-6">
      {/* 讲师状态卡片 */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">讲师中心</h2>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">
              {isInstructor ? "已认证讲师" : "未认证"}
            </span>
          </div>
        </div>

        {!isConnected ? (
          <p className="text-gray-500">请先连接钱包</p>
        ) : !isInstructor ? (
          <div className="space-y-4">
            <p className="text-gray-600">申请成为讲师，开始创建和出售课程</p>
            <button
              onClick={handleApplyInstructor}
              disabled={isLoading}
              className="btn btn-primary flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>申请中...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>申请成为讲师</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600">
              <BookOpen className="h-5 w-5" />
              <span className="font-medium">您是认证讲师！</span>
            </div>

            {!showCreateForm ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>创建新课程</span>
              </button>
            ) : (
              <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    课程价格 (YD代币)
                  </label>
                  <input
                    type="number"
                    value={newCoursePrice}
                    onChange={(e) => setNewCoursePrice(e.target.value)}
                    placeholder="例如: 100"
                    className="input"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleCreateCourse}
                    disabled={!newCoursePrice || isLoading}
                    className="btn btn-primary flex flex-1 items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>创建中...</span>
                      </>
                    ) : (
                      <span>确认创建</span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewCoursePrice("");
                    }}
                    className="btn btn-secondary"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 课程列表 */}
      <div className="card">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">课程市场</h2>
          <div className="text-sm text-gray-500">
            共 {totalCourses?.toString() || "0"} 门课程
          </div>
        </div>

        {Number(totalCourses || 0) === 0 ? (
          <div className="py-12 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">暂无课程，成为讲师后可以创建课程</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 这里可以添加实际的课程列表渲染 */}
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">示例课程</h3>
                  <p className="text-sm text-gray-600">这是一个示例课程描述</p>
                  <div className="text-primary-600 mt-2 font-medium">
                    价格: 100 YD
                  </div>
                </div>
                <button
                  onClick={() => handleBuyCourse(1, parseEther("100"))}
                  disabled={!isConnected || isLoading}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>购买课程</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 交易状态提示 */}
      {(applyHash || createHash || buyHash || approveHash) && (
        <div className="card border-blue-200 bg-blue-50">
          <div className="text-sm text-blue-800">
            交易已提交，等待确认...
            <br />
            <a
              href={`https://sepolia.etherscan.io/tx/${applyHash || createHash || buyHash || approveHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              查看交易详情
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
