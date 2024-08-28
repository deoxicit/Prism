import React, { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useAccount } from 'wagmi';
import { prismAbi } from '../../Contract/prism';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;
const PINATA_GATEWAY_TOKEN = import.meta.env.VITE_PINATA_GATEWAY_TOKEN as string;
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY as string;

interface ArticleData {
  title: string;
  originalAuthor: `0x${string}`;
  timestamp: bigint;
  mintPrice: bigint;
  parentTokenId: bigint;
  tags: string[];
  owner: `0x${string}`;
}

interface ArticleContent {
  title: string;
  content: string;
  backgroundImageHash: string;
}

const ArticleList: React.FC = () => {
  const { address } = useAccount();
  const { toast } = useToast();
  const [mintingTokenId, setMintingTokenId] = useState<bigint | null>(null);

  const { data: allArticles, isLoading: isLoadingArticles, error: readError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: prismAbi,
    functionName: 'listAllArticles',
  });

  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleMint = (tokenId: bigint, mintPrice: bigint) => {
    if (!address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to mint an article.",
        variant: "destructive",
      });
      return;
    }

    setMintingTokenId(tokenId);

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: prismAbi,
        functionName: 'mintArticle',
        args: [tokenId],
        value: mintPrice,
      });
    } catch (error) {
      console.error('Error in handleMint:', error);
      toast({
        title: "Error",
        description: "An error occurred while minting the article. Please try again.",
        variant: "destructive",
      });
      setMintingTokenId(null);
    }
  };

  React.useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Article Minted",
        description: "You have successfully minted the article!",
      });
      setMintingTokenId(null);
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
          isPending={isPending && mintingTokenId === tokenId}
          isConfirming={isConfirming && mintingTokenId === tokenId}
          address={address}
        />
      ))}
    </div>
  );
};

const ArticleCard: React.FC<{
  tokenId: bigint;
  onMint: (tokenId: bigint, mintPrice: bigint) => void;
  isPending: boolean;
  isConfirming: boolean;
  address?: `0x${string}`;
}> = ({ tokenId, onMint, isPending, isConfirming, address }) => {
  const { data: article, isLoading: isLoadingArticle } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: prismAbi,
    functionName: 'getArticle',
    args: [tokenId],
  });

  const { data: owner, isLoading: isLoadingOwner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: prismAbi,
    functionName: 'ownerOf',
    args: [tokenId],
  });

  const { data: tokenURI, isLoading: isLoadingTokenURI } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: prismAbi,
    functionName: 'tokenURI',
    args: [tokenId],
  });

  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);

  useEffect(() => {
    const fetchContent = async () => {
      if (tokenURI && typeof tokenURI === 'string') {
        setIsLoadingContent(true);
        try {
          const url = `https://${PINATA_GATEWAY}/ipfs/${tokenURI}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;
          const response = await fetch(url);
          const jsonContent: ArticleContent = await response.json();
          if (jsonContent.backgroundImageHash) {
            setBackgroundImageUrl(`https://${PINATA_GATEWAY}/ipfs/${jsonContent.backgroundImageHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`);
          }
        } catch (error) {
          console.error('Error fetching content from IPFS:', error);
        } finally {
          setIsLoadingContent(false);
        }
      }
    };

    fetchContent();
  }, [tokenURI]);

  if (isLoadingContent || isLoadingArticle || isLoadingTokenURI || isLoadingOwner || !article || !owner) {
    return (
      <Card className="flex flex-col h-48 justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </Card>
    );
  }

  const { title, originalAuthor, timestamp, mintPrice, tags } = article as ArticleData;

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="flex flex-col">
      {backgroundImageUrl && (
        <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImageUrl})` }} />
      )}
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex justify-between">
          <p className="text-sm text-muted-foreground mb-2">
            Creator: {formatAddress(originalAuthor)}
          </p>
          <p className="text-sm text-muted-foreground mb-2">
            Owner: {formatAddress(owner as string)}
          </p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm text-muted-foreground mb-2">
            Created: {new Date(Number(timestamp) * 1000).toLocaleDateString()}
          </p>
          <p className="text-sm text-muted-foreground mb-2">
            Tags: {tags.join(', ')}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex flex-row align-middle gap-5">
          <Button
            onClick={() => onMint(tokenId, mintPrice)}
            disabled={isPending || isConfirming || !address || address === owner}
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isPending ? 'Minting...' : 'Confirming...'}
              </>
            ) : address === owner ? (
              'You own this'
            ) : (
              `Mint for ${formatEther(mintPrice)} ETH`
            )}
          </Button>
          <Button>
            <Link to={`/article/${tokenId}`}>View Details</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ArticleList;