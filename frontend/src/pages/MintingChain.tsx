import React from 'react';
import { useReadContract } from 'wagmi';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { prismAbi } from '../../Contract/prism';
import { useContractAddress } from '../utils/contracts';

interface MintingChainProps {
    chain: bigint[];
}

const MintingChain: React.FC<MintingChainProps> = ({ chain }) => {
    const contractAddress = useContractAddress();

    console.log('MintingChain rendered with chain:', chain);
    console.log('Contract address:', contractAddress);

    if (!chain || chain.length === 0) {
        return <Card className="w-full"><CardContent>No minting chain data available.</CardContent></Card>;
    }

    return (
        <Card className="w-full">
            <CardContent>
                <div className="space-y-4">
                    {chain.map((tokenId, index) => (
                        <ChainLink key={tokenId.toString()} tokenId={tokenId} index={index} contractAddress={contractAddress} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

interface ChainLinkProps {
    tokenId: bigint;
    index: number;
    contractAddress: `0x${string}`;
}

const ChainLink: React.FC<ChainLinkProps> = ({ tokenId, index, contractAddress }) => {
    const { data: article, isLoading, error } = useReadContract({
        address: contractAddress,
        abi: prismAbi,
        functionName: 'getArticle',
        args: [tokenId],
    });

    console.log(`ChainLink ${index} rendered for tokenId:`, tokenId.toString());
    console.log(`ChainLink ${index} data:`, article);
    console.log(`ChainLink ${index} error:`, error);

    if (isLoading) {
        return (
            <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading article {tokenId.toString()}...</span>
            </div>
        );
    }

    if (error) {
        return <div>Error loading article {tokenId.toString()}: {error.message}</div>;
    }

    if (!article) {
        return <div>No data for article {tokenId.toString()}</div>;
    }

    const { title, originalAuthor } = article as { title: string; originalAuthor: string };

    return (
        <div className="p-2 border rounded-md">
            <div className="font-bold">{index + 1}. {title}</div>
            <div className="text-sm text-muted-foreground">
                ID: {tokenId.toString()}
            </div>
            <div className="text-sm text-muted-foreground">
                Author: {`${originalAuthor.slice(0, 6)}...${originalAuthor.slice(-4)}`}
            </div>
        </div>
    );
};

export default MintingChain;