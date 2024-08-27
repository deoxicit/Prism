# PRISM

This project implements a system for creating, minting, updating, viewing, and transferring Article NFTs. It provides a set of smart contract functions to manage the lifecycle of digital articles as non-fungible tokens on the blockchain.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Process Flow](#process-flow)
- [Function Descriptions](#function-descriptions)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [License](#license)

## Overview

The [PRISM]("https://github.com/deoxicit/Prism") allows users to tokenize digital articles as NFTs, creating a verifiable chain of ownership and provenance for written content. This system enables content creators to monetize their work, readers to support authors directly, and a transparent ecosystem for digital publishing.

## Features

- Create new Article NFTs
- Mint new NFTs from existing articles
- Update article content (for owners)
- View article details
- Examine the minting chain of an article
- Transfer ownership of Article NFTs

## Process Flow

The following flowchart illustrates the main processes and decision points in the Article NFT system:

```mermaid
graph TD
    A[Start] --> B{User Action}
    B -->|Create Article| C[Call createArticle]
    B -->|Mint from Existing| D[Call mintArticle]
    B -->|Update Article| E[Call updateArticle]
    B -->|View Article| F[Call getArticle]
    B -->|View Minting Chain| G[Call getMintingChain]
    B -->|Transfer Article| H[Call transferFrom]
    
    C --> I{Is Valid?}
    I -->|Yes| J[Mint New NFT]
    I -->|No| K[Revert Transaction]
    J --> L[Set Token URI]
    L --> M[Store Article Details]
    M --> N[Emit ArticleCreated Event]
    
    D --> O{Parent Exists?}
    O -->|Yes| P{Sufficient Payment?}
    O -->|No| K
    P -->|Yes| Q[Mint New NFT]
    P -->|No| K
    Q --> R[Copy Parent Metadata]
    R --> S[Distribute Royalties]
    S --> T[Emit ArticleMinted Event]
    
    E --> U{Is Owner?}
    U -->|Yes| V[Update Article Details]
    U -->|No| K
    V --> W[Update Token URI]
    
    F --> X[Return Article Details]
    
    G --> Y[Calculate and Return Minting Chain]
    
    H --> Z{Is Authorized?}
    Z -->|Yes| AA[Transfer NFT Ownership]
    Z -->|No| K
    
    N --> AB[End]
    T --> AB
    W --> AB
    X --> AB
    Y --> AB
    AA --> AB
    K --> AB
```

## Function Descriptions

1. `createArticle`: Creates a new Article NFT with original content.
2. `mintArticle`: Mints a new NFT based on an existing article, establishing a derivative relationship.
3. `updateArticle`: Allows the owner to update the content of their Article NFT.
4. `getArticle`: Retrieves the details of a specific Article NFT.
5. `getMintingChain`: Returns the lineage of an Article NFT, showing its derivation history.
6. `transferFrom`: Transfers ownership of an Article NFT to a new address.

# Getting Started
>
> ```git clone https://github.com/deoxicit/Prism.git```

## Backend

1. >```cd PrismContract```

2. > ```forge install```

3. > Update env with appropriate values

### Deploy contract
>
> forge create Prism --rpc-url opencampuscodex --private-key=private_Key --constructor-args {primary_contract_owner_address}

### Verify Deployed Contract
>
> forge verify-contract --rpc-url <https://rpc.open-campus-codex.gelato.digital> --verifier blockscout --verifier-url '<https://opencampus-codex.blockscout.com/api/>' {contract_address} --compiler-version v0.8.26 src/Prism.sol:Prism

## Frontend

1. >```cd frontend```

2. > ```pnpm install```

### Update env with appropriate values

3. > ```pnpm run dev```

## Contributing

We welcome contributions to the [PRISM]("https://github.com/deoxicit/Prism").
