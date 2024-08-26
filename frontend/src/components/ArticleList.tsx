import React from 'react';
import { useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useAccount } from 'wagmi';
import { prismAbi } from '../generated';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

type ArticleData = {
  title: string;
  originalAuthor: `0x${string}`;
  timestamp: bigint;
  mintPrice: bigint;
  parentTokenId: bigint;
};

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;

const ArticleList: React.FC = () => {
  const { address } = useAccount();
  const { toast } = useToast();

  const { data: articleData, isLoading: isLoadingArticles, error: readError } = useReadContracts({
    contracts: Array.from({ length: 10 }, (_, i) => ({
      address: CONTRACT_ADDRESS,
      abi: prismAbi,
      functionName: 'articles',
      args: [BigInt(i)],
    })),
  });

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleMint = (tokenId: number) => {
    if (!address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to mint an article.",
        variant: "destructive",
      });
      return;
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: prismAbi,
        functionName: 'mintArticle',
        args: [BigInt(tokenId)],
        value: BigInt(100000000000000000), // 0.1 ETH
      });
    } catch (error) {
      console.error('Error in handleMint:', error);
      toast({
        title: "Error",
        description: "An error occurred while minting the article. Please try again.",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Article Minted",
        description: "You have successfully minted the article!",
      });
    }
  }, [isSuccess, toast]);

  if (readError) {
    console.error('Read Contracts Error:', readError);
    return <div className="text-center text-red-600">Error loading articles. Please try again later.</div>;
  }

  if (isLoadingArticles) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articleData?.map((article, index) => {
        if (!article.result || !Array.isArray(article.result) || article.result.length !== 5) return null;
        
        const [title, originalAuthor, timestamp, mintPrice, parentTokenId] = article.result as unknown as [string, `0x${string}`, bigint, bigint, bigint];
        
        const articleData: ArticleData = {
          title,
          originalAuthor,
          timestamp,
          mintPrice,
          parentTokenId
        };
        
        return (
          <Card key={index} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">{articleData.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground mb-2">
                By: {articleData.originalAuthor.slice(0, 6)}...{articleData.originalAuthor.slice(-4)}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Mint Price: {formatEther(articleData.mintPrice)} ETH
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Created: {new Date(Number(articleData.timestamp) * 1000).toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Parent Token ID: {articleData.parentTokenId.toString()}
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleMint(index)} 
                disabled={isPending || isConfirming || !address}
                className="w-full"
              >
                {isPending || isConfirming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isPending ? 'Minting...' : 'Confirming...'}
                  </>
                ) : (
                  'Mint Article'
                )}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default ArticleList;