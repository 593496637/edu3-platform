import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia, mainnet } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'Edu3 Platform',
  projectId: '2ca53d0d-3b4d-4b6e-8b8a-6b0e8b8a6b0e', // 临时项目ID，需要替换为真实的WalletConnect项目ID
  chains: [sepolia, mainnet],
  ssr: false,
})