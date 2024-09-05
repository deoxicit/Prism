import React, { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { prismAbi } from '../../../Contract/prism';
import { PINATA_GATEWAY, PINATA_GATEWAY_TOKEN } from '../../constants';
import { ArticleData, ArticleContent } from '../../utils/types';
import { formatAddress } from '../../utils/formatAddress';
import { useContractAddress } from '../../utils/contracts';

interface ArticleCardProps {
  tokenId: bigint;
  address?: `0x${string}`;
  toast: any;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ tokenId, address, toast }) => {
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
  const contractAddress = useContractAddress();

  const { data: article, isLoading: isLoadingArticle } = useReadContract({
    address: contractAddress,
    abi: prismAbi,
    functionName: 'getArticle',
    args: [tokenId],
  });

  const { data: owner, isLoading: isLoadingOwner } = useReadContract({
    address: contractAddress,
    abi: prismAbi,
    functionName: 'ownerOf',
    args: [tokenId],
  });

  const { data: tokenURI, isLoading: isLoadingTokenURI } = useReadContract({
    address: contractAddress,
    abi: prismAbi,
    functionName: 'tokenURI',
    args: [tokenId],
  });

  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

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

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Article Minted",
        description: "You have successfully minted the article!",
      });
    }
  }, [isSuccess, toast]);

  const handleMint = (tokenId: bigint, mintPrice: bigint) => {
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
        address: contractAddress,
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
    }
  };

  if (isLoadingContent || isLoadingArticle || isLoadingTokenURI || isLoadingOwner || !article || !owner) {
    return (
      <Card className="flex flex-col h-48 justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </Card>
    );
  }

  const { title, originalAuthor, timestamp, mintPrice, tags } = article as ArticleData;

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
            onClick={() => handleMint(tokenId, mintPrice)}
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

export default ArticleCard;