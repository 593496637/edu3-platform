import React, { useState } from 'react';
import { usePublicClient, useReadContract } from 'wagmi';
import { CONTRACTS, COURSE_PLATFORM_ABI } from '../lib/contracts';

const DebugApplicationTool: React.FC = () => {
  const publicClient = usePublicClient();
  const [debugAddress, setDebugAddress] = useState('');
  const [debugResults, setDebugResults] = useState<any>(null);
  const [blockRange, setBlockRange] = useState('5000');
  const [loading, setLoading] = useState(false);

  // 检查特定地址的申请状态
  const { data: hasApplied } = useReadContract({
    address: CONTRACTS.CoursePlatform,
    abi: COURSE_PLATFORM_ABI,
    functionName: 'instructorApplications',
    args: debugAddress ? [debugAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!debugAddress && debugAddress.startsWith('0x') && debugAddress.length === 42,
    },
  });

  const { data: isInstructor } = useReadContract({
    address: CONTRACTS.CoursePlatform,
    abi: COURSE_PLATFORM_ABI,
    functionName: 'isInstructor',
    args: debugAddress ? [debugAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!debugAddress && debugAddress.startsWith('0x') && debugAddress.length === 42,
    },
  });

  // 深度搜索申请事件
  const deepSearchApplications = async () => {
    if (!publicClient) return;

    try {
      setLoading(true);
      setDebugResults(null);

      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = currentBlock - BigInt(parseInt(blockRange));

      console.log(`搜索区块范围: ${fromBlock} 到 ${currentBlock}`);

      // 搜索所有申请事件
      const allApplicationLogs = await publicClient.getLogs({
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

      // 搜索所有批准事件
      const allApprovalLogs = await publicClient.getLogs({
        address: CONTRACTS.CoursePlatform,
        event: {
          type: 'event',
          name: 'InstructorApproved',
          inputs: [
            { indexed: true, name: 'instructor', type: 'address' }
          ]
        },
        fromBlock,
        toBlock: 'latest'
      });

      const results = {
        searchRange: `${fromBlock} - ${currentBlock}`,
        totalApplications: allApplicationLogs.length,
        totalApprovals: allApprovalLogs.length,
        applications: allApplicationLogs.map(log => ({
          applicant: log.args.applicant,
          blockNumber: log.blockNumber.toString(),
          transactionHash: log.transactionHash,
        })),
        approvals: allApprovalLogs.map(log => ({
          instructor: log.args.instructor,
          blockNumber: log.blockNumber.toString(),
          transactionHash: log.transactionHash,
        })),
      };

      // 如果指定了调试地址，特别检查
      if (debugAddress) {
        const addressLower = debugAddress.toLowerCase();
        const userApplications = allApplicationLogs.filter(
          log => log.args.applicant?.toLowerCase() === addressLower
        );
        const userApprovals = allApprovalLogs.filter(
          log => log.args.instructor?.toLowerCase() === addressLower
        );

        results.debugInfo = {
          address: debugAddress,
          hasApplied: Boolean(hasApplied),
          isInstructor: Boolean(isInstructor),
          applicationEvents: userApplications.length,
          approvalEvents: userApprovals.length,
          applicationDetails: userApplications,
          approvalDetails: userApprovals,
        };
      }

      setDebugResults(results);
    } catch (error) {
      console.error('深度搜索失败:', error);
      setDebugResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 申请调试工具</h3>
      
      <div className="space-y-4">
        {/* 调试特定地址 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            调试钱包地址（可选）
          </label>
          <input
            type="text"
            value={debugAddress}
            onChange={(e) => setDebugAddress(e.target.value)}
            placeholder="0x... (输入要调试的钱包地址)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 搜索范围 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            搜索区块范围
          </label>
          <select
            value={blockRange}
            onChange={(e) => setBlockRange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1000">最近 1,000 个区块</option>
            <option value="5000">最近 5,000 个区块</option>
            <option value="10000">最近 10,000 个区块</option>
            <option value="50000">最近 50,000 个区块</option>
          </select>
        </div>

        <button
          onClick={deepSearchApplications}
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            loading
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? '🔍 搜索中...' : '🔍 开始深度搜索'}
        </button>
      </div>

      {/* 当前状态显示 */}
      {debugAddress && debugAddress.startsWith('0x') && debugAddress.length === 42 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">当前状态查询</h4>
          <div className="text-sm space-y-1">
            <p>地址: <code className="font-mono text-xs">{debugAddress}</code></p>
            <p>已申请: <span className={hasApplied ? 'text-green-600' : 'text-red-600'}>
              {hasApplied ? '✅ 是' : '❌ 否'}
            </span></p>
            <p>是讲师: <span className={isInstructor ? 'text-green-600' : 'text-red-600'}>
              {isInstructor ? '✅ 是' : '❌ 否'}
            </span></p>
          </div>
        </div>
      )}

      {/* 搜索结果 */}
      {debugResults && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-3">搜索结果</h4>
          
          {debugResults.error ? (
            <div className="text-red-600">
              错误: {debugResults.error}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm">
                <p>搜索范围: 区块 {debugResults.searchRange}</p>
                <p>总申请事件: {debugResults.totalApplications}</p>
                <p>总批准事件: {debugResults.totalApprovals}</p>
              </div>

              {debugResults.debugInfo && (
                <div className="border-t pt-4">
                  <h5 className="font-medium text-gray-800 mb-2">特定地址调试信息</h5>
                  <div className="text-sm space-y-1">
                    <p>申请事件数量: {debugResults.debugInfo.applicationEvents}</p>
                    <p>批准事件数量: {debugResults.debugInfo.approvalEvents}</p>
                    
                    {debugResults.debugInfo.applicationDetails.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium">申请事件详情:</p>
                        {debugResults.debugInfo.applicationDetails.map((app: any, index: number) => (
                          <div key={index} className="ml-4 text-xs font-mono">
                            区块: {app.blockNumber}, 交易: {app.transactionHash.slice(0, 10)}...
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {debugResults.applications.length > 0 && (
                <div className="border-t pt-4">
                  <h5 className="font-medium text-gray-800 mb-2">所有申请事件</h5>
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {debugResults.applications.map((app: any, index: number) => (
                      <div key={index} className="text-xs font-mono p-2 bg-white rounded">
                        {app.applicant} (区块: {app.blockNumber})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DebugApplicationTool;