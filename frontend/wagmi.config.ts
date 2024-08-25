import { defineConfig } from '@wagmi/cli'
import { foundry, react } from '@wagmi/cli/plugins'

export default defineConfig({
  out: 'src/generated.ts',
  contracts: [],
  plugins: [
    foundry({
      project: '../PrismContract',
      deployments: {
        EduPumpToken: {
          // You'll update this address after deploying your contract
          0xA045C: '0x...',  // Replace 12345 with your Arbitrum Orbit chain ID
        },
      },
    }),
    react(),
  ],
})