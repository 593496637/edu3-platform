import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import { Loader2, Plus, ShoppingCart, Users, BookOpen, CheckCircle, AlertCircle } from "lucide-react";
import { CONTRACTS, COURSE_PLATFORM_ABI, YD_TOKEN_ABI } from "../lib/contracts";
import { useInstructorStatus, useBalance, usePurchaseVerification, useCourses, usePurchaseStatus } from "../hooks/useApi";

interface PurchaseState {
  step: 'idle' | 'approving' | 'approved' | 'purchasing' | 'verifying' | 'completed' | 'error';
  courseId?: number;
  error?: string;
}

export default function CourseList() {
  const { address, isConnected } = useAccount();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCoursePrice, setNewCoursePrice] = useState("");
  const [purchaseState, setPurchaseState] = useState<PurchaseState>({ step: 'idle' });

  // API hooks
  const { isInstructor, isLoading: instructorLoading, refetch: refetchInstructorStatus } = useInstructorStatus(address);
  const { balanceFormatted, refetch: refetchBalance } = useBalance(address);
  const { verifyPurchase, isLoading: isVerifying } = usePurchaseVerification();
  const { courses, isLoading: coursesLoading, refetch: refetchCourses } = useCourses();

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

  // 处理购买成功后验证交易
  useEffect(() => {
    if (isBuySuccess && purchaseState.step === 'purchasing' && buyHash && purchaseState.courseId && address) {
      setPurchaseState({ step: 'verifying', courseId: purchaseState.courseId });
      
      // 验证并记录购买交易
      verifyPurchase(buyHash, purchaseState.courseId, address)
        .then(() => {
          setPurchaseState({ step: 'completed', courseId: purchaseState.courseId });
          refetchBalance();
          refetchCourses();
          // 3秒后重置状态
          setTimeout(() => {
            setPurchaseState({ step: 'idle' });
          }, 3000);
        })
        .catch((error) => {
          setPurchaseState({ 
            step: 'error', 
            courseId: purchaseState.courseId, 
            error: error.message 
          });
        });
    }
  }, [isBuySuccess, purchaseState, buyHash, address, verifyPurchase, refetchBalance, refetchCourses]);

  // 处理交易错误
  useEffect(() => {
    if (isApproveError || isBuyError) {
      setPurchaseState({ 
        step: 'error', 
        error: isApproveError ? '代币授权失败' : '购买交易失败'
      });
    }
  }, [isApproveError, isBuyError]);

  const handleApplyInstructor = () => {
    applyInstructor({
      address: CONTRACTS.CoursePlatform,
      abi: COURSE_PLATFORM_ABI,
      functionName: "applyToBeInstructor",
    });
  };

  const handleCreateCourse = () => {
    if (!newCoursePrice) return;
    
    createCourse({
      address: CONTRACTS.CoursePlatform,
      abi: COURSE_PLATFORM_ABI,
      functionName: "createCourse",
      args: [parseEther(newCoursePrice)],
    });
  };

  const handlePurchaseCourse = async (courseId: number, price: string) => {
    if (!address) return;
    
    // 重置状态
    resetApprove();
    resetBuy();
    setPurchaseState({ step: 'approving', courseId });
    
    try {
      // 先授权代币
      approveTokens({
        address: CONTRACTS.YDToken,
        abi: YD_TOKEN_ABI,
        functionName: "approve",
        args: [CONTRACTS.CoursePlatform, BigInt(price)],
      });
    } catch (error) {
      setPurchaseState({ 
        step: 'error', 
        courseId, 
        error: error instanceof Error ? error.message : '授权失败'
      });
    }
  };

  const resetPurchaseState = () => {
    setPurchaseState({ step: 'idle' });
    resetApprove();
    resetBuy();
  };

  if (!isConnected) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow">
        <Users className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          请连接钱包
        </h3>
        <p className="text-gray-500">
          连接钱包后即可查看和购买课程
        </p>
      </div>
    );
  }

  if (coursesLoading || instructorLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">加载中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 用户状态卡片 */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">我的状态</h3>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600">
                YD代币余额: <span className="font-semibold">{balanceFormatted}</span>
              </p>
              <p className="text-sm text-gray-600">
                讲师状态: 
                <span className={`ml-1 font-semibold ${isInstructor ? 'text-green-600' : 'text-gray-500'}`}>
                  {isInstructor ? '已认证' : '未认证'}
                </span>
              </p>
            </div>
          </div>
          
          {!isInstructor && (
            <button
              onClick={handleApplyInstructor}
              disabled={isApplyPending || isApplyConfirming}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isApplyPending || isApplyConfirming ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Users className="mr-2 h-4 w-4" />
              )}
              申请成为讲师
            </button>
          )}
        </div>
      </div>

      {/* 创建课程 */}
      {isInstructor && (
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">创建课程</h3>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              创建新课程
            </button>
          </div>

          {showCreateForm && (
            <div className="border-t pt-4">
              <div className="flex space-x-4">
                <input
                  type="number"
                  placeholder="课程价格 (YD代币)"
                  value={newCoursePrice}
                  onChange={(e) => setNewCoursePrice(e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={handleCreateCourse}
                  disabled={!newCoursePrice || isCreatePending || isCreateConfirming}
                  className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isCreatePending || isCreateConfirming ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  创建课程
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 购买状态提示 */}
      {purchaseState.step !== 'idle' && (
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {purchaseState.step === 'completed' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : purchaseState.step === 'error' ? (
                <AlertCircle className="h-5 w-5 text-red-600" />
              ) : (
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              )}
              <span className="ml-2 text-sm font-medium">
                {purchaseState.step === 'approving' && '正在授权代币...'}
                {purchaseState.step === 'approved' && '授权成功，准备购买...'}
                {purchaseState.step === 'purchasing' && '正在购买课程...'}
                {purchaseState.step === 'verifying' && '正在验证交易...'}
                {purchaseState.step === 'completed' && '购买成功！'}
                {purchaseState.step === 'error' && `购买失败: ${purchaseState.error}`}
              </span>
            </div>
            {(purchaseState.step === 'completed' || purchaseState.step === 'error') && (
              <button
                onClick={resetPurchaseState}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                关闭
              </button>
            )}
          </div>
        </div>
      )}

      {/* 课程列表 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          所有课程 ({courses.length})
        </h3>
        
        {courses.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              暂无课程
            </h3>
            <p className="text-gray-500">
              还没有课程发布，成为讲师创建第一门课程吧！
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                currentUser={address}
                onPurchase={handlePurchaseCourse}
                isPurchasing={purchaseState.courseId === course.chain_id && purchaseState.step !== 'idle'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 课程卡片组件
function CourseCard({ 
  course, 
  currentUser, 
  onPurchase, 
  isPurchasing 
}: { 
  course: any;
  currentUser?: string;
  onPurchase: (courseId: number, price: string) => void;
  isPurchasing: boolean;
}) {
  const { hasPurchased, isLoading: purchaseStatusLoading } = usePurchaseStatus(
    course.chain_id,
    currentUser
  );

  const isOwner = currentUser?.toLowerCase() === course.instructor_address?.toLowerCase();
  const priceFormatted = course.priceformatted || (Number(course.price) / 1e18).toFixed(0);

  return (
    <div className="rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow">
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-900">
          {course.title}
        </h4>
        <p className="mt-2 text-sm text-gray-600">
          {course.description}
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">讲师</p>
          <p className="text-sm font-medium text-gray-900">
            {course.instructor_address?.slice(0, 6)}...
            {course.instructor_address?.slice(-4)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">价格</p>
          <p className="text-lg font-semibold text-blue-600">
            {priceFormatted} YD
          </p>
        </div>
      </div>

      <div className="flex space-x-3">
        {isOwner ? (
          <div className="flex-1 rounded-md bg-gray-100 px-4 py-2 text-center text-sm text-gray-600">
            我的课程
          </div>
        ) : hasPurchased ? (
          <div className="flex flex-1 items-center justify-center rounded-md bg-green-100 px-4 py-2 text-sm text-green-700">
            <CheckCircle className="mr-2 h-4 w-4" />
            已购买
          </div>
        ) : (
          <button
            onClick={() => onPurchase(course.chain_id, course.price)}
            disabled={isPurchasing || purchaseStatusLoading}
            className="flex flex-1 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPurchasing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="mr-2 h-4 w-4" />
            )}
            购买课程
          </button>
        )}
      </div>
    </div>
  );
}
