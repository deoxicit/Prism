/// <reference types="vite/client" />

interface ImportMetaEnv {
    VITE_WC_PROJECT_ID: string
    VITE_CONTRACT_ADDRESS: string
    VITE_PINATA_JWT: string
    VITE_PINATA_GATEWAY: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }