import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia, mainnet } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'Edu3 Platform',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
  chains: [sepolia, mainnet],
  ssr: false,
})