import { http, createConfig } from 'wagmi'
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors'

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

const lineaSepolia = {
  id: 59141,
  name: 'Linea Sepolia',
  nativeCurrency: { name: 'Linea ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://linea-sepolia.infura.io/v3/d742656554e74d2a897b6139b0488b50'] },
  },
  blockExplorers: {
    default: { name: 'LineaScan', url: 'https://sepolia.lineascan.build' },
  },
} as const

export const config = createConfig({
  chains: [lineaSepolia,openCampusCodex],
  connectors: [
    injected(),
    coinbaseWallet(),
    walletConnect({ projectId: 'f20bb281737292196e8908bbf250c37e' }),
  ],
  transports: {
    [openCampusCodex.id]: http('https://rpc.open-campus-codex.gelato.digital/'),
    [lineaSepolia.id]: http('https://linea-sepolia.infura.io/v3/d742656554e74d2a897b6139b0488b50'),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}