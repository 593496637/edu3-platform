import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import {
  ArrowLeft,
  Play,
  Clock,
  Users,
  Star,
  ShoppingCart,
  BookOpen,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { CONTRACTS, COURSE_PLATFORM_ABI, YD_TOKEN_ABI } from "../lib/contracts";

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  price: bigint;
  duration: string;
  difficulty: string;
  rating: number;
  studentsCount: number;
  lessons: Array<{
    id: number;
    title: string;
    duration: string;
    isPreview: boolean;
  }>;
  requirements: string[];
  whatYouWillLearn: string[];
}

interface PurchaseState {
  step: 'idle' | 'approving' | 'approved' | 'purchasing' | 'completed' | 'error';
  error?: string;
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [purchaseState, setPurchaseState] = useState<PurchaseState>({ step: 'idle' });

  // 模拟课程数据 - 实际应用中应该从后端API获取
  const course: Course = {
    id: Number(id),
    title: `Web3开发基础课程 ${id}`,
    description: "这是一门全面的Web3开发课程，涵盖区块链基础、智能合约开发、DApp构建等核心技能。通过理论学习和实践项目，帮助您从零开始掌握Web3开发。",
    instructor: "0x1234567890123456789012345678901234567890",
    price: parseEther("100"),
    duration: "20小时",
    difficulty: "初级",
    rating: 4.8,
    studentsCount: 156,
    lessons: [
      { id: 1, title: "Web3概述和区块链基础", duration: "45分钟", isPreview: true },
      { id: 2, title: "以太坊网络和智能合约介绍", duration: "60分钟", isPreview: true },
      { id: 3, title: "Solidity语言基础", duration: "90分钟", isPreview: false },
      { id: 4, title: "智能合约开发实践", duration: "120分钟", isPreview: false },
      { id: 5, title: "前端DApp开发", duration: "150分钟", isPreview: false },
      { id: 6, title: "Web3项目部署", duration: "90分钟", isPreview: false },
    ],
    requirements: [
      "具备基本的编程经验（JavaScript/Python等）",
      "了解基本的网络和数据库概念",
      "有学习新技术的热情和耐心",
    ],
    whatYouWillLearn: [
      "理解区块链和以太坊的工作原理",
      "掌握Solidity智能合约开发",
      "学会使用Web3.js和ethers.js",
      "能够构建完整的DApp应用",
      "了解DeFi和NFT开发基础",
      "掌握智能合约安全最佳实践",
    ],
  };

  // 检查用户是否已购买课程
  const { data: hasPurchased } = useReadContract({
    address: CONTRACTS.CoursePlatform,
    abi: COURSE_PLATFORM_ABI,
    functionName: "hasPurchasedCourse",
    args: address && id ? [BigInt(id), address] : undefined,
    query: {
      enabled: !!address && !!id,
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
    if (isApproveSuccess && purchaseState.step === 'approving') {
      setPurchaseState({ step: 'approved' });
      
      // 自动执行购买
      setTimeout(() => {
        if (id) {
          buyCourse({
            address: CONTRACTS.CoursePlatform,
            abi: COURSE_PLATFORM_ABI,
            functionName: "buyCourse",
            args: [BigInt(id)],
          });
          setPurchaseState({ step: 'purchasing' });
        }
      }, 1000);
    }
  }, [isApproveSuccess, purchaseState, buyCourse, id]);

  // 处理购买成功
  useEffect(() => {
    if (isBuySuccess && purchaseState.step === 'purchasing') {
      setPurchaseState({ step: 'completed' });
      // 3秒后重置状态并跳转到学习页面
      setTimeout(() => {
        setPurchaseState({ step: 'idle' });
        resetApprove();
        resetBuy();
        navigate(`/course/${id}/learn`);
      }, 3000);
    }
  }, [isBuySuccess, purchaseState, resetApprove, resetBuy, navigate, id]);

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

  const handlePurchase = () => {
    if (!isConnected || !id) return;

    // 检查余额是否足够
    if (ydBalance && ydBalance < course.price) {
      setPurchaseState({ step: 'error', error: 'YD代币余额不足' });
      setTimeout(() => setPurchaseState({ step: 'idle' }), 3000);
      return;
    }

    // 开始购买流程
    setPurchaseState({ step: 'approving' });

    // 授权平台使用用户的YD代币
    approveTokens({
      address: CONTRACTS.YDToken,
      abi: YD_TOKEN_ABI,
      functionName: "approve",
      args: [CONTRACTS.CoursePlatform, course.price],
    });
  };

  const renderPurchaseButton = () => {
    if (!isConnected) {
      return (
        <button className="w-full rounded-lg bg-gray-400 px-6 py-3 font-medium text-white cursor-not-allowed">
          请先连接钱包
        </button>
      );
    }

    if (hasPurchased) {
      return (
        <Link
          to={`/course/${id}/learn`}
          className="w-full flex items-center justify-center rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
        >
          <Play className="mr-2 h-5 w-5" />
          开始学习
        </Link>
      );
    }

    switch (purchaseState.step) {
      case 'approving':
        return (
          <button
            disabled
            className="w-full flex items-center justify-center rounded-lg bg-yellow-600 px-6 py-3 font-medium text-white"
          >
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            授权中...
          </button>
        );
      case 'approved':
        return (
          <button
            disabled
            className="w-full flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-medium text-white"
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            授权成功
          </button>
        );
      case 'purchasing':
        return (
          <button
            disabled
            className="w-full flex items-center justify-center rounded-lg bg-orange-600 px-6 py-3 font-medium text-white"
          >
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            购买中...
          </button>
        );
      case 'completed':
        return (
          <button
            disabled
            className="w-full flex items-center justify-center rounded-lg bg-green-600 px-6 py-3 font-medium text-white"
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            购买成功！即将跳转...
          </button>
        );
      case 'error':
        return (
          <button
            disabled
            className="w-full flex items-center justify-center rounded-lg bg-red-600 px-6 py-3 font-medium text-white"
          >
            {purchaseState.error}
          </button>
        );
      default:
        return (
          <button
            onClick={handlePurchase}
            className="w-full flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            购买课程 - {(Number(course.price) / 1e18).toFixed(0)} YD
          </button>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 返回按钮 */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* 左侧主要内容 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 课程头部信息 */}
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                <p className="mt-2 text-lg text-gray-600">{course.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Star className="mr-1 h-4 w-4 text-yellow-400" />
                  <span className="font-medium">{course.rating}</span>
                </div>
                <div className="flex items-center">
                  <Users className="mr-1 h-4 w-4" />
                  <span>{course.studentsCount} 学员</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="rounded-full bg-green-100 px-2 py-1 text-green-800">
                  {course.difficulty}
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <p className="text-sm text-gray-500">
                  讲师: {course.instructor.slice(0, 6)}...{course.instructor.slice(-4)}
                </p>
              </div>
            </div>

            {/* 课程内容 */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">课程内容</h2>
              <div className="space-y-3">
                {course.lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className={`flex items-center justify-between rounded-lg border p-4 ${
                      lesson.isPreview ? "border-blue-200 bg-blue-50" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                        <p className="text-sm text-gray-500">{lesson.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {lesson.isPreview && (
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                          免费预览
                        </span>
                      )}
                      <Play className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 你将学到什么 */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">你将学到什么</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {course.whatYouWillLearn.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 课程要求 */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">课程要求</h2>
              <ul className="space-y-2">
                {course.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400"></div>
                    <span className="text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 右侧购买卡片 */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 rounded-lg bg-white p-6 shadow">
              {/* 课程预览 */}
              <div className="mb-6 aspect-video rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Play className="h-12 w-12 text-white" />
              </div>

              {/* 价格 */}
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900">
                  {(Number(course.price) / 1e18).toFixed(0)} YD
                </div>
                <div className="text-sm text-gray-500">一次购买，终身学习</div>
              </div>

              {/* 购买按钮 */}
              <div className="mb-6">
                {renderPurchaseButton()}
              </div>

              {/* 包含内容 */}
              <div className="space-y-3 border-t pt-6">
                <h3 className="font-medium text-gray-900">此课程包含:</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration} 点播视频</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.lessons.length} 个课程</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>终身访问</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>完成证书</span>
                  </div>
                </div>
              </div>

              {/* 余额显示 */}
              {isConnected && (
                <div className="mt-6 rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">您的YD余额:</span>
                    <span className="font-medium">
                      {ydBalance ? (Number(ydBalance) / 1e18).toFixed(2) : "0"} YD
                    </span>
                  </div>
                  {ydBalance && ydBalance < course.price && (
                    <div className="mt-2 text-sm text-red-600">
                      余额不足，请先
                      <Link to="/exchange" className="text-red-700 underline">
                        兑换YD代币
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 交易状态提示 */}
        {(approveHash || buyHash) && (
          <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="text-sm text-blue-800">
              交易已提交，等待确认...
              <br />
              <a
                href={`https://sepolia.etherscan.io/tx/${approveHash || buyHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                查看交易详情
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
