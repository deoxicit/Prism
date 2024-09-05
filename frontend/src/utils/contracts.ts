import { useChainId } from 'wagmi'

const CONTRACT_ADDRESSES: { [chainId: number]: `0x${string}` } = {
  656476: import.meta.env.VITE_CONTRACT_ADDRESS_OPEN_CAMPUS as `0x${string}`,
  59141: import.meta.env.VITE_CONTRACT_ADDRESS_LINEA_SEPOLIA as `0x${string}`,
}

export function useContractAddress(): `0x${string}` {
  const chainId = useChainId()
  
  const address = CONTRACT_ADDRESSES[chainId]
  
  if (!address) {
    throw new Error(`No contract address found for chain ID ${chainId}`)
  }

  return address
}