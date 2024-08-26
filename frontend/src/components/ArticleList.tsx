import React from 'react';
import { useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useAccount } from 'wagmi';
import { prismAbi } from '../generated';

type ArticleData = readonly [string, `0x${string}`, bigint, bigint, bigint];

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;

const ArticleList: React.FC = () => {
  const { address } = useAccount();

  const { data: articleData, isLoading: isLoadingArticles, error: readError } = useReadContracts({
    contracts: [
      {
        address: CONTRACT_ADDRESS,
        abi: prismAbi,
        functionName: 'articles',
        args: [BigInt(0)],
      },
      {
        address: CONTRACT_ADDRESS,
        abi: prismAbi,
        functionName: 'articles',
        args: [BigInt(1)],
      },
      // Add more article reads as needed
    ],
  });

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleMint = (tokenId: number) => {
    if (!address) return;

    try {
      console.log('Minting article:', tokenId);
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: prismAbi,
        functionName: 'mintArticle',
        args: [BigInt(tokenId)],
        value: BigInt(100000000000000000), // 0.1 ETH
      });
    } catch (error) {
      console.error('Error in handleMint:', error);
    }
  };

  if (readError) {
    console.error('Read Contracts Error:', readError);
  }

  if (writeError) {
    console.error('Write Contract Error:', writeError);
  }

  if (isLoadingArticles) {
    return <p>Loading articles...</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {articleData?.map((article, index) => {
        if (!article.result) return null;
        
        const [title, originalAuthor, timestamp, mintPrice, parentTokenId] = article.result as ArticleData;
        
        return (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Author: {originalAuthor}
              </p>
              <p className="text-sm text-gray-600">
                Mint Price: {formatEther(mintPrice)} ETH
              </p>
              <p className="text-sm text-gray-600">
                Created: {new Date(Number(timestamp) * 1000).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                Parent Token ID: {parentTokenId.toString()}
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleMint(index)} 
                disabled={isPending || isConfirming || !address}
              >
                {isPending ? 'Minting...' : isConfirming ? 'Confirming...' : 'Mint Article'}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
      {isSuccess && (
        <p className="text-green-600">Article minted successfully!</p>
      )}
      {(readError || writeError) && (
        <p className="text-red-600">Error occurred. Please check console for details.</p>
      )}
    </div>
  );
};

export default ArticleList;