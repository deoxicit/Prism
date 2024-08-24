import { defineConfig } from '@wagmi/cli'
import { hardhat, react } from '@wagmi/cli/plugins'

export default defineConfig({
  out: 'src/generated.ts',
  contracts: [],
  plugins: [
    hardhat({
      project: '../',
      deployments: {
        EduPumpToken: {
          // You'll update this address after deploying your contract
          12345: '0x...',  // Replace 12345 with your Arbitrum Orbit chain ID
        },
      },
    }),
    react(),
  ],
})