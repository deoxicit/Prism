import React, { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useAccount } from 'wagmi';
import { prismAbi } from '../../Contract/prism';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { PinataSDK } from "pinata";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT as string;
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY as string;

const pinata = new PinataSDK({ pinataJwt: PINATA_JWT, pinataGateway: PINATA_GATEWAY });

interface ArticleData {
  title: string;
  originalAuthor: `0x${string}`;
  timestamp: bigint;
  mintPrice: bigint;
  parentTokenId: bigint;
  tags: string[];
  contentHash: string;
}

const ArticleList: React.FC = () => {
  const { address } = useAccount();
  const { toast } = useToast();

  const { data: allArticles, isLoading: isLoadingArticles, error: readError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: prismAbi,
    functionName: 'listAllArticles',
  });

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleMint = (tokenId: bigint) => {
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
        args: [tokenId],
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
    console.error('Read Contract Error:', readError);
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
      {allArticles && allArticles.map((tokenId) => (
        <ArticleCard 
          key={tokenId.toString()} 
          tokenId={tokenId} 
          onMint={handleMint} 
          isPending={isPending} 
          isConfirming={isConfirming}
          address={address}
        />
      ))}
    </div>
  );
};

const ArticleCard: React.FC<{
  tokenId: bigint;
  onMint: (tokenId: bigint) => void;
  isPending: boolean;
  isConfirming: boolean;
  address?: `0x${string}`;
}> = ({ tokenId, onMint, isPending, isConfirming, address }) => {
  const { data: article, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: prismAbi,
    functionName: 'getArticle',
    args: [tokenId],
  });

  const [content, setContent] = useState<string>('');
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);

  useEffect(() => {
    const fetchContent = async () => {
      if (article && (article as ArticleData).contentHash) {
        setIsLoadingContent(true);
        try {
          const response = await pinata.getFile((article as ArticleData).contentHash);
          if (typeof response === 'string') {
            const jsonContent = JSON.parse(response);
            setContent(jsonContent.content);
          } else {
            console.error('Unexpected response type from Pinata');
          }
        } catch (error) {
          console.error('Error fetching content from IPFS:', error);
          setContent('Error loading content');
        }
        setIsLoadingContent(false);
      }
    };

    fetchContent();
  }, [article]);

  if (isLoading || !article) {
    return (
      <Card className="flex flex-col h-48 justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </Card>
    );
  }

  const { title, originalAuthor, timestamp, mintPrice, parentTokenId, tags } = article as ArticleData;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-2">
          By: {originalAuthor.slice(0, 6)}...{originalAuthor.slice(-4)}
        </p>
        <p className="text-sm text-muted-foreground mb-2">
          Mint Price: {formatEther(mintPrice)} ETH
        </p>
        <p className="text-sm text-muted-foreground mb-2">
          Created: {new Date(Number(timestamp) * 1000).toLocaleDateString()}
        </p>
        <p className="text-sm text-muted-foreground mb-2">
          Parent Token ID: {parentTokenId.toString()}
        </p>
        <p className="text-sm text-muted-foreground mb-2">
          Tags: {tags.join(', ')}
        </p>
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Content Preview:</h4>
          {isLoadingContent ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <p className="text-sm">{content.slice(0, 150)}...</p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => onMint(tokenId)} 
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
};

export default ArticleList;