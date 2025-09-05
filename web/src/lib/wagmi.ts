import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'EDU3 Web3大学',
  projectId: 'YOUR_PROJECT_ID', // 可以暂时留空，或从 https://cloud.walletconnect.com 获取
  chains: [sepolia],
  ssr: false,
});

export { sepolia };