import React from 'react';
import { useReadContract } from 'wagmi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { prismAbi } from '../../Contract/prism';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;

interface MintingChainProps {
    chain: bigint[];
}

const MintingChain: React.FC<MintingChainProps> = ({ chain }) => {
    return (
        <Card className="w-full h-full overflow-auto">
            <CardHeader>
                <CardTitle>Minting Chain</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {chain.map((tokenId, index) => (
                        <ChainLink key={tokenId.toString()} tokenId={tokenId} index={index} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

interface ChainLinkProps {
    tokenId: bigint;
    index: number;
}

const ChainLink: React.FC<ChainLinkProps> = ({ tokenId, index }) => {
    const { data: article, isLoading } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: prismAbi,
        functionName: 'getArticle',
        args: [tokenId],
    });

    if (isLoading) {
        return (
            <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading article {tokenId.toString()}...</span>
            </div>
        );
    }

    if (!article) {
        return <div>Error loading article {tokenId.toString()}</div>;
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