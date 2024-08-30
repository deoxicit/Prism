import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useAccount } from 'wagmi';
import { prismAbi } from '../../Contract/prism';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import JoditEditor from "jodit-react";
import MintingChain from './MintingChain';

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
}

const ArticleDetailPage: React.FC = () => {
    const { tokenId } = useParams<{ tokenId: string }>();
    const { address } = useAccount();
    const { toast } = useToast();
    const [content, setContent] = useState<string>('');
    const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
    const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
    const [showMintingChain, setShowMintingChain] = useState<boolean>(false);

    const { data: article, isLoading: isLoadingArticle } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: prismAbi,
        functionName: 'getArticle',
        args: [BigInt(tokenId!)],
    });

    const { data: tokenURI, isLoading: isLoadingTokenURI } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: prismAbi,
        functionName: 'tokenURI',
        args: [BigInt(tokenId!)],
    });

    const { data: owner, isLoading: isLoadingOwner } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: prismAbi,
        functionName: 'ownerOf',
        args: [BigInt(tokenId!)],
    });

    const { data: mintingChain, isLoading: isLoadingMintingChain } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: prismAbi,
        functionName: 'getMintingChain',
        args: [BigInt(tokenId!)],
    });

    const { writeContract, data: hash, isPending } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const config = useMemo(() => ({
        readonly: true,
        toolbar: false,
        showCharsCounter: false,
        showWordsCounter: false,
        showXPathInStatusbar: false,
        width: '100%',
        height: 'auto',
        minHeight: 300,
        buttons: [],
        disablePlugins: 'draganddrop,dropImage,paste,paste-storage',
    }), []);

    useEffect(() => {
        const fetchContent = async () => {
            if (tokenURI && typeof tokenURI === 'string') {
                setIsLoadingContent(true);
                try {
                    const url = `https://${PINATA_GATEWAY}/ipfs/${tokenURI}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;
                    const response = await fetch(url);
                    const jsonContent = await response.json();
                    setContent(jsonContent.content);
                    if (jsonContent.backgroundImageHash) {
                        setBackgroundImageUrl(`https://${PINATA_GATEWAY}/ipfs/${jsonContent.backgroundImageHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`);
                    }
                } catch (error) {
                    console.error('Error fetching content from IPFS:', error);
                    setContent('Error loading content');
                }
                setIsLoadingContent(false);
            }
        };

        fetchContent();
    }, [tokenURI]);

    const handleMint = () => {
        if (!address) {
            toast({
                title: "Wallet not connected",
                description: "Please connect your wallet to mint an article.",
                variant: "destructive",
            });
            return;
        }

        if (!article) {
            toast({
                title: "Error",
                description: "Article data is not available.",
                variant: "destructive",
            });
            return;
        }

        const { mintPrice } = article as ArticleData;

        try {
            writeContract({
                address: CONTRACT_ADDRESS,
                abi: prismAbi,
                functionName: 'mintArticle',
                args: [BigInt(tokenId!)],
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

    const handleGetMintingChain = () => {
        setShowMintingChain(true);
    };

    React.useEffect(() => {
        if (isSuccess) {
            toast({
                title: "Article Minted",
                description: "You have successfully minted the article!",
            });
        }
    }, [isSuccess, toast]);

    if (isLoadingArticle || isLoadingTokenURI || isLoadingOwner || !article || !owner) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-12 w-12 animate-spin" />
            </div>
        );
    }

    const { title, originalAuthor, timestamp, mintPrice, tags } = article as ArticleData;

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
                <div className={`w-full ${showMintingChain ? 'lg:w-2/3' : 'lg:w-full'}`}>
                    <Card className="w-full">
                        {backgroundImageUrl && (
                            <div className="h-80 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImageUrl})` }} />
                        )}
                        <CardHeader>
                            <CardTitle className="text-3xl font-bold">{title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-6">
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
                            </div>
                            <CardFooter className="flex justify-between gap-2">
                                <Button
                                    onClick={handleMint}
                                    disabled={isPending || isConfirming || !address || address === owner}
                                    className="w-1/2"
                                >
                                    {isPending || isConfirming ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {isPending ? 'Minting...' : 'Confirming...'}
                                        </>
                                    ) : address === owner ? (
                                        'You own this article'
                                    ) : (
                                        `Mint Article for ${formatEther(mintPrice)} ETH`
                                    )}
                                </Button>

                                <Button
                                    onClick={handleGetMintingChain}
                                    disabled={isLoadingMintingChain || showMintingChain}
                                    className={`${showMintingChain ? 'w-full lg:w-1/3' : 'w-full lg:w-1/2'}`}
                                >
                                    {isLoadingMintingChain ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Loading Chain...
                                        </>
                                    ) : showMintingChain ? (
                                        'Minting Chain Loaded'
                                    ) : (
                                        'Get Minting Chain'
                                    )}
                                </Button>
                            </CardFooter>
                            <div className="mt-8">
                                {isLoadingContent ? (
                                    <div className="flex justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                    </div>
                                ) : (
                                    <JoditEditor
                                        value={content}
                                        config={config}
                                        onBlur={() => { }}
                                        onChange={() => { }}
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                {showMintingChain && mintingChain ? (
                    <div className="w-full lg:w-1/3">
                        <MintingChain chain={mintingChain as bigint[]} />
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default ArticleDetailPage;