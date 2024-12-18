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

export const config = createConfig({
  chains: [openCampusCodex],
  connectors: [
    injected(),
    coinbaseWallet(),
    walletConnect({ projectId: 'f20bb281737292196e8908bbf250c37e' }),
  ],
  transports: {
    [openCampusCodex.id]: http('https://rpc.open-campus-codex.gelato.digital/'),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}