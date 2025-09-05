import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatEther, parseEther } from 'viem';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 格式化ETH数量显示
export function formatETH(value: bigint, decimals = 4): string {
  const formatted = formatEther(value);
  return parseFloat(formatted).toFixed(decimals);
}

// 格式化YD代币数量显示
export function formatYDToken(value: bigint, decimals = 2): string {
  const formatted = formatEther(value);
  return parseFloat(formatted).toFixed(decimals);
}

// 截短地址显示
export function truncateAddress(address: string, start = 6, end = 4): string {
  if (!address) return '';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

// 安全的parseEther，处理空字符串
export function safeParseEther(value: string): bigint {
  if (!value || value.trim() === '') return 0n;
  try {
    return parseEther(value);
  } catch {
    return 0n;
  }
}