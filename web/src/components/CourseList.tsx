import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import { Loader2, Plus, ShoppingCart, Users, BookOpen, CheckCircle } from "lucide-react";
import { CONTRACTS, COURSE_PLATFORM_ABI, YD_TOKEN_ABI } from "../lib/contracts";
import { formatYDToken } from "../lib/utils";

interface PurchaseState {
  step: 'idle' | 'approving' | 'approved' | 'purchasing' | 'completed' | 'error';
  courseId?: number;
  error?: string;
}

export default function CourseList() {
  const { address, isConnected } = useAccount();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCoursePrice, setNewCoursePrice] = useState("");
  const [purchaseState, setPurchaseState] = useState<PurchaseState>({ step: 'idle' });

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

  // 授权YD代币
  const {
    writeContract: approveTokens,
    data: approveHash,
    isPending: isApprovePending,
    reset: resetApprove,
  } = useWriteContract();

  // 购买课程
  const {
    writeContract: buyCourse,
    data: buyHash,
    isPending: isBuyPending,
    reset: resetBuy,
  } = useWriteContract();

  // 等待交易确认
  const { isLoading: isApplyConfirming } = useWaitForTransactionReceipt({
    hash: applyHash,
  });

  const { isLoading: isCreateConfirming } = useWaitForTransactionReceipt({
    hash: createHash,
  });

  const { 
    isLoading: isApproveConfirming, 
    isSuccess: isApproveSuccess,
    isError: isApproveError,
  } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { 
    isLoading: isBuyConfirming, 
    isSuccess: isBuySuccess,
    isError: isBuyError,
  } = useWaitForTransactionReceipt({
    hash: buyHash,
  });

  // 处理approve成功后自动购买
  useEffect(() => {
    if (isApproveSuccess && purchaseState.step === 'approving' && purchaseState.courseId) {
      setPurchaseState({ step: 'approved', courseId: purchaseState.courseId });
      
      // 自动执行购买
      setTimeout(() => {
        buyCourse({
          address: CONTRACTS.CoursePlatform,
          abi: COURSE_PLATFORM_ABI,
          functionName: "buyCourse",
          args: [BigInt(purchaseState.courseId)],
        });
        setPurchaseState({ step: 'purchasing', courseId: purchaseState.courseId });
      }, 1000);
    }
  }, [isApproveSuccess, purchaseState, buyCourse]);

  // 处理购买成功
  useEffect(() => {
    if (isBuySuccess && purchaseState.step === 'purchasing') {
      setPurchaseState({ step: 'completed' });
      // 3秒后重置状态
      setTimeout(() => {
        setPurchaseState({ step: 'idle' });
        resetApprove();
        resetBuy();
      }, 3000);
    }
  }, [isBuySuccess, purchaseState, resetApprove, resetBuy]);

  // 处理交易失败
  useEffect(() => {
    if (isApproveError && purchaseState.step === 'approving') {
      setPurchaseState({ step: 'error', error: '代币授权失败' });
      setTimeout(() => setPurchaseState({ step: 'idle' }), 3000);
    }
    if (isBuyError && purchaseState.step === 'purchasing') {
      setPurchaseState({ step: 'error', error: '课程购买失败' });
      setTimeout(() => setPurchaseState({ step: 'idle' }), 3000);
    }
  }, [isApproveError, isBuyError, purchaseState]);

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

    // 检查余额是否足够
    if (ydBalance && ydBalance < price) {
      setPurchaseState({ step: 'error', error: 'YD代币余额不足' });
      setTimeout(() => setPurchaseState({ step: 'idle' }), 3000);
      return;
    }

    // 开始购买流程
    setPurchaseState({ step: 'approving', courseId });

    // 授权平台使用用户的YD代币
    approveTokens({
      address: CONTRACTS.YDToken,
      abi: YD_TOKEN_ABI,
      functionName: "approve",
      args: [CONTRACTS.CoursePlatform, price],
    });
  };

  const isLoading =
    isApplyPending ||
    isCreatePending ||
    isApplyConfirming ||
    isCreateConfirming ||
    purchaseState.step !== 'idle';

  // 渲染购买按钮状态
  const renderPurchaseButton = (courseId: number, price: bigint) => {
    const isPurchasing = purchaseState.courseId === courseId && purchaseState.step !== 'idle';
    
    if (isPurchasing) {
      switch (purchaseState.step) {
        case 'approving':
          return (
            <button
              disabled
              className="flex flex-1 items-center justify-center rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white"
            >
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              授权中...
            </button>
          );
        case 'approved':
          return (
            <button
              disabled
              className="flex flex-1 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              授权成功
            </button>
          );
        case 'purchasing':
          return (
            <button
              disabled
              className="flex flex-1 items-center justify-center rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white"
            >
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              购买中...
            </button>
          );
        case 'completed':
          return (
            <button
              disabled
              className="flex flex-1 items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              购买成功
            </button>
          );
        case 'error':
          return (
            <button
              disabled
              className="flex flex-1 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white"
            >
              购买失败
            </button>
          );
        default:
          break;
      }
    }

    return (
      <button
        onClick={() => handleBuyCourse(courseId, price)}
        disabled={!isConnected || isLoading}
        className="flex flex-1 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        购买课程
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* 余额显示 */}
      {isConnected && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">YD代币余额:</span>
            <span className="text-lg font-bold text-blue-900">
              {ydBalance ? formatYDToken(ydBalance) : "0"} YD
            </span>
          </div>
        </div>
      )}

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
            {/* 示例课程 - 实际应用中应该从链上获取真实数据 */}
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Web3开发基础课程</h3>
                  <p className="text-sm text-gray-600">学习区块链和智能合约开发的基础知识</p>
                  <div className="text-primary-600 mt-2 font-medium">
                    价格: 100 YD
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <BookOpen className="mr-2 h-4 w-4" />
                    查看详情
                  </button>
                  {renderPurchaseButton(1, parseEther("100"))}
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">智能合约进阶</h3>
                  <p className="text-sm text-gray-600">深入学习Solidity和DeFi协议开发</p>
                  <div className="text-primary-600 mt-2 font-medium">
                    价格: 200 YD
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <BookOpen className="mr-2 h-4 w-4" />
                    查看详情
                  </button>
                  {renderPurchaseButton(2, parseEther("200"))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 购买状态提示 */}
      {purchaseState.step === 'error' && (
        <div className="card border-red-200 bg-red-50">
          <div className="text-sm text-red-800">
            ❌ {purchaseState.error}
          </div>
        </div>
      )}

      {/* 交易状态提示 */}
      {(applyHash || createHash || approveHash || buyHash) && (
        <div className="card border-blue-200 bg-blue-50">
          <div className="text-sm text-blue-800">
            交易已提交，等待确认...
            <br />
            <a
              href={`https://sepolia.etherscan.io/tx/${applyHash || createHash || approveHash || buyHash}`}
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
