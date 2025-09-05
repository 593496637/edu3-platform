import React from 'react';
import { formatEther } from 'viem';
import { 
  useSmartBalance, 
  useTransactionBalance,
  useTokenTransactionHistory,
  useCoursePurchaseHistory,
  usePlatformStats,
  useRecentActivity,
  useBalanceHistory,
  useMarketOverview,
  useQueryStrategy,
} from '../hooks/useSmartQueries';

// 🟢 通用余额显示组件 - 使用 The Graph
export function BalanceDisplay() {
  const balance = useSmartBalance(false); // 混合策略
  
  return (
    <div className="balance-display">
      <div className="eth-balance">
        <span>ETH: {balance.eth.formatted}</span>
        <small>({balance.eth.source})</small>
      </div>
      
      <div className="yd-balance">
        <span>YD: {balance.yd.formatted}</span>
        <small>
          ({balance.yd.source})
          {balance.yd.lastUpdated && (
            <span> - Updated: {new Date(parseInt(balance.yd.lastUpdated) * 1000).toLocaleString()}</span>
          )}
        </small>
      </div>
      
      <div className="strategy-info">
        <span>Strategy: {balance.strategy}</span>
        {balance.isRealtime && <span className="realtime-badge">🔴 Real-time</span>}
        {!balance.isGraphHealthy && <span className="warning">⚠️ Graph unavailable</span>}
      </div>
      
      {balance.isLoading && <div>Loading...</div>}
      {balance.error && <div className="error">Error: {balance.error}</div>}
      
      <button onClick={balance.refetch}>Refresh</button>
    </div>
  );
}

// 🔴 交易前余额确认组件 - 强制使用 RPC
export function TransactionBalanceCheck() {
  const balance = useTransactionBalance(); // 强制 RPC
  
  return (
    <div className="transaction-balance">
      <h3>Transaction Balance Verification</h3>
      <div className="realtime-balances">
        <div>ETH: {balance.eth.formatted} (Real-time ✅)</div>
        <div>YD: {balance.yd.formatted} (Real-time ✅)</div>
      </div>
      
      {balance.isLoading && <div>Fetching real-time balance...</div>}
      
      <div className="verification-info">
        <small>✅ This balance is fetched directly from RPC for accuracy</small>
      </div>
    </div>
  );
}

// 🟢 交易历史组件 - 使用 The Graph
export function TransactionHistory() {
  const { transactions, isLoading, error, loadMore, hasMore } = useTokenTransactionHistory(10);
  
  if (isLoading) return <div>Loading transaction history...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div className="transaction-history">
      <h3>Transaction History (The Graph 🟢)</h3>
      
      <div className="transactions">
        {transactions.map((tx) => (
          <div key={tx.id} className={`transaction ${tx.type}`}>
            <div className="type">{tx.type === 'purchase' ? '🛒' : '💰'} {tx.type}</div>
            <div className="amount">
              {tx.type === 'purchase' 
                ? `+${formatEther(BigInt(tx.amount))} YD` 
                : `-${formatEther(BigInt(tx.amount))} YD`
              }
            </div>
            <div className="eth-amount">
              {formatEther(BigInt(tx.ethAmount))} ETH
            </div>
            <div className="timestamp">
              {new Date(parseInt(tx.blockTimestamp) * 1000).toLocaleString()}
            </div>
            <div className="hash">
              <a href={`https://etherscan.io/tx/${tx.transactionHash}`} target="_blank" rel="noopener noreferrer">
                {tx.transactionHash.slice(0, 10)}...
              </a>
            </div>
          </div>
        ))}
      </div>
      
      {hasMore && (
        <button onClick={loadMore} className="load-more">
          Load More
        </button>
      )}
    </div>
  );
}

// 🟢 课程购买记录 - 使用 The Graph
export function CoursePurchaseHistory() {
  const { purchases, isLoading, error, refetch } = useCoursePurchaseHistory();
  
  if (isLoading) return <div>Loading course purchases...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div className="course-history">
      <h3>My Course Purchases (The Graph 🟢)</h3>
      
      <div className="courses">
        {purchases.map((purchase) => (
          <div key={purchase.id} className="course-purchase">
            <div className="course-id">Course #{purchase.courseId}</div>
            <div className="price">{formatEther(BigInt(purchase.price))} YD</div>
            <div className="author">By: {purchase.author.slice(0, 10)}...</div>
            <div className="date">
              {new Date(parseInt(purchase.blockTimestamp) * 1000).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
      
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}

// 🟢 平台统计仪表板 - 使用 The Graph
export function PlatformDashboard() {
  const { stats, isLoading, error } = usePlatformStats();
  const { activities } = useRecentActivity(5);
  const { marketData } = useMarketOverview('24h');
  
  if (isLoading) return <div>Loading platform stats...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!stats) return <div>No data available</div>;
  
  return (
    <div className="platform-dashboard">
      <h2>Platform Analytics (The Graph 🟢)</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Token Transactions</h4>
          <div className="stat-value">{stats.totalPurchases + stats.totalSales}</div>
        </div>
        
        <div className="stat-card">
          <h4>Course Purchases</h4>
          <div className="stat-value">{stats.totalCoursePurchases}</div>
        </div>
        
        <div className="stat-card">
          <h4>Total Instructors</h4>
          <div className="stat-value">{stats.totalInstructors}</div>
        </div>
        
        <div className="stat-card">
          <h4>Trading Volume (24h)</h4>
          <div className="stat-value">
            {stats.totalVolume.eth.toFixed(2)} ETH
          </div>
        </div>
        
        <div className="stat-card">
          <h4>Course Revenue</h4>
          <div className="stat-value">
            {stats.courseRevenue.toFixed(2)} YD
          </div>
        </div>
      </div>
      
      {marketData && (
        <div className="market-overview">
          <h4>24h Market Overview</h4>
          <div>Transactions: {marketData.transactionCount}</div>
          <div>Average Price: {marketData.averagePrice.toFixed(6)} ETH/YD</div>
        </div>
      )}
      
      <div className="recent-activity">
        <h4>Recent Activity</h4>
        {activities.slice(0, 5).map((activity) => (
          <div key={activity.id} className="activity-item">
            <span className="activity-type">
              {activity.type === 'token_purchase' && '🛒'}
              {activity.type === 'course_purchase' && '📚'}
              {activity.type === 'course_created' && '✨'}
              {activity.type}
            </span>
            <span className="activity-time">
              {new Date(parseInt(activity.blockTimestamp) * 1000).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 🟢 余额趋势图表 - 使用 The Graph
export function BalanceTrendChart() {
  const { balanceHistory, isLoading, error } = useBalanceHistory(7); // 7天历史
  
  if (isLoading) return <div>Loading balance history...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div className="balance-trend">
      <h3>Balance History (7 days) - The Graph 🟢</h3>
      
      <div className="chart-container">
        {balanceHistory.length === 0 ? (
          <div>No transaction history in the past 7 days</div>
        ) : (
          <div className="simple-chart">
            {balanceHistory.map((point, index) => (
              <div key={index} className="chart-point">
                <div className="date">
                  {new Date(parseInt(point.timestamp) * 1000).toLocaleDateString()}
                </div>
                <div className="balance">{parseFloat(point.balance).toFixed(4)} YD</div>
                <div className={`change ${point.type}`}>
                  {point.type === 'purchase' || point.type === 'transfer_in' ? '+' : '-'}
                  {parseFloat(point.change).toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 🎯 使用策略指南组件
export function QueryStrategyGuide() {
  const strategy = useQueryStrategy();
  
  return (
    <div className="strategy-guide">
      <h3>🎯 Query Strategy Guide</h3>
      
      <div className="strategy-section">
        <h4>🟢 For Browsing & Display (Use The Graph)</h4>
        <ul>
          <li>✅ Balance display: <code>useSmartBalance(false)</code></li>
          <li>✅ Transaction history: <code>useTokenTransactionHistory()</code></li>
          <li>✅ Course purchase records: <code>useCoursePurchaseHistory()</code></li>
          <li>✅ Platform statistics: <code>usePlatformStats()</code></li>
          <li>✅ Recent activity: <code>useRecentActivity()</code></li>
          <li>✅ Balance trends: <code>useBalanceHistory()</code></li>
        </ul>
      </div>
      
      <div className="strategy-section">
        <h4>🔴 For Transactions (Must Use RPC)</h4>
        <ul>
          <li>🔴 Pre-transaction balance: <code>useTransactionBalance()</code></li>
          <li>🔴 All writeContract operations</li>
          <li>🔴 Real-time permission checks</li>
          <li>🔴 Exchange rate queries</li>
        </ul>
      </div>
      
      <div className="strategy-section">
        <h4>🟡 Hybrid Strategy</h4>
        <ul>
          <li>🟡 Course purchase validation: <code>useCoursePurchaseStatus()</code></li>
          <li>🟡 Balance with fallback: <code>useSmartBalance(false)</code></li>
        </ul>
      </div>
    </div>
  );
}

// 🚀 完整演示页面
export function OptimizationDemo() {
  return (
    <div className="optimization-demo">
      <h1>🚀 EDU3 Platform - Query Optimization Demo</h1>
      
      <div className="demo-grid">
        <div className="demo-section">
          <BalanceDisplay />
        </div>
        
        <div className="demo-section">
          <TransactionBalanceCheck />
        </div>
        
        <div className="demo-section">
          <TransactionHistory />
        </div>
        
        <div className="demo-section">
          <CoursePurchaseHistory />
        </div>
        
        <div className="demo-section">
          <PlatformDashboard />
        </div>
        
        <div className="demo-section">
          <BalanceTrendChart />
        </div>
        
        <div className="demo-section">
          <QueryStrategyGuide />
        </div>
      </div>
      
      <style jsx>{`
        .optimization-demo {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .demo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        
        .demo-section {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
          background: #f9f9f9;
        }
        
        .balance-display, .transaction-balance {
          background: #e8f5e8;
        }
        
        .transaction-history, .course-history {
          background: #e8f0ff;
        }
        
        .platform-dashboard {
          background: #fff8e8;
        }
        
        .balance-trend {
          background: #f0e8ff;
        }
        
        .strategy-guide {
          background: #ffe8e8;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px;
          margin: 10px 0;
        }
        
        .stat-card {
          background: white;
          padding: 10px;
          border-radius: 4px;
          text-align: center;
        }
        
        .stat-value {
          font-size: 1.5em;
          font-weight: bold;
          color: #2563eb;
        }
        
        .transaction {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          margin: 4px 0;
          background: white;
          border-radius: 4px;
        }
        
        .transaction.purchase {
          border-left: 4px solid #10b981;
        }
        
        .transaction.sale {
          border-left: 4px solid #f59e0b;
        }
        
        .realtime-badge {
          color: #dc2626;
          font-weight: bold;
        }
        
        .warning {
          color: #f59e0b;
        }
        
        .error {
          color: #dc2626;
          font-weight: bold;
        }
        
        .strategy-section {
          margin: 10px 0;
          padding: 10px;
          border-radius: 4px;
        }
        
        .strategy-section h4 {
          margin: 0 0 8px 0;
        }
        
        .strategy-section ul {
          margin: 0;
          padding-left: 20px;
        }
        
        code {
          background: #f3f4f6;
          padding: 2px 4px;
          border-radius: 2px;
          font-family: monospace;
        }
      `}</style>
    </div>
  );
}

export default OptimizationDemo;
