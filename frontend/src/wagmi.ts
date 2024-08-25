import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors'

// Define the Open Campus Codex chain
const openCampusCodex = {
  id: 656476,
  name: 'Open Campus Codex',
  nativeCurrency: { name: 'EDU', symbol: 'EDU', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.open-campus-codex.gelato.digital/'] },
  },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://opencampus-codex.blockscout.com/' },
  },
} as const

export const config = createConfig({
  chains: [mainnet, sepolia, openCampusCodex],
  connectors: [
    injected(),
    coinbaseWallet(),
    walletConnect({ projectId: import.meta.env.VITE_WC_PROJECT_ID }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [openCampusCodex.id]: http('https://rpc.open-campus-codex.gelato.digital/'),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}