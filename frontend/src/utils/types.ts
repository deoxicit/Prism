export interface ArticleData {
    title: string;
    originalAuthor: `0x${string}`;
    timestamp: bigint;
    mintPrice: bigint;
    parentTokenId: bigint;
    tags: string[];
    owner: `0x${string}`;
  }
  
  export interface ArticleContent {
    title: string;
    content: string;
    backgroundImageHash: string;
  }