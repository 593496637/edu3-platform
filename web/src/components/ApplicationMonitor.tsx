import React, { useState, useEffect } from 'react';
import { usePublicClient, useReadContract } from 'wagmi';
import { CONTRACTS, COURSE_PLATFORM_ABI } from '../lib/contracts';
import { useAdminFunctions } from '../hooks/useAdminFunctions';

interface ApplicationEvent {
  applicant: string;
  blockNumber: bigint;
  transactionHash: string;
  timestamp?: number;
  isInstructor?: boolean;
}

const ApplicationMonitor: React.FC = () => {
  const publicClient = usePublicClient();
  const { approveInstructor, isProcessing } = useAdminFunctions();
  const [applications, setApplications] = useState<ApplicationEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取历史申请事件
  const fetchApplicationEvents = async () => {
    if (!publicClient) return;

    try {
      setLoading(true);
      
      // 获取最近的申请事件（最近1000个区块）
      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = currentBlock - 1000n;

      const logs = await publicClient.getLogs({
        address: CONTRACTS.CoursePlatform,
        event: {
          type: 'event',
          name: 'InstructorApplicationSubmitted',
          inputs: [
            { indexed: true, name: 'applicant', type: 'address' }
          ]
        },
        fromBlock,
        toBlock: 'latest'
      });

      const events: ApplicationEvent[] = logs.map(log => ({
        applicant: log.args.applicant as string,
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
      }));

      // 为每个申请检查当前状态
      const eventsWithStatus = await Promise.all(
        events.map(async (event) => {
          try {
            const isInstructor = await publicClient.readContract({
              address: CONTRACTS.CoursePlatform,
              abi: COURSE_PLATFORM_ABI,
              functionName: 'isInstructor',
              args: [event.applicant]
            });
            return { ...event, isInstructor: isInstructor as boolean };
          } catch {
            return { ...event, isInstructor: false };
          }
        })
      );

      setApplications(eventsWithStatus.reverse()); // 最新的在前面
    } catch (error) {
      console.error('获取申请事件失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationEvents();
  }, [publicClient]);

  const handleApprove = async (applicant: string) => {
    await approveInstructor(applicant);
    // 重新获取状态
    setTimeout(() => {
      fetchApplicationEvents();
    }, 3000);
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">📋 讲师申请监控</h3>
        <button
          onClick={fetchApplicationEvents}
          disabled={loading}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50"
        >
          {loading ? '刷新中...' : '🔄 刷新'}
        </button>
      </div>

      {loading && applications.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">加载申请记录中...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>暂无讲师申请记录</p>
          <p className="text-sm mt-1">申请提交后会在这里显示</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app, index) => (
            <div
              key={`${app.transactionHash}-${index}`}
              className={`p-4 rounded-lg border ${
                app.isInstructor 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${
                      app.isInstructor ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></span>
                    <code className="text-sm font-mono text-gray-800">
                      {app.applicant}
                    </code>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-600">
                    <p>区块: #{app.blockNumber.toString()}</p>
                    <p>交易: {app.transactionHash.slice(0, 10)}...{app.transactionHash.slice(-8)}</p>
                  </div>
                </div>

                <div className="ml-4">
                  {app.isInstructor ? (
                    <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                      ✅ 已批准
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApprove(app.applicant)}
                      disabled={isProcessing}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        isProcessing
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {isProcessing ? '处理中...' : '✅ 批准'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>💡 提示: 这里显示最近1000个区块内的申请记录</p>
        <p>🔍 绿色表示已批准，黄色表示待审核</p>
      </div>
    </div>
  );
};

export default ApplicationMonitor;