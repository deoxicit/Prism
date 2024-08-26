import React, { useState, FormEvent } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useAccount } from 'wagmi';
import { prismAbi } from '../generated';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;

const CreateArticle: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [mintPrice, setMintPrice] = useState<string>('');
  const { address } = useAccount();

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!address) return;

    try {
      console.log('Submitting article:', { title, content, mintPrice });
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: prismAbi,
        functionName: 'createArticle',
        args: [title, content, parseEther(mintPrice)],
      });
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create New Article</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              placeholder="Article Title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              required
            />
            <Textarea
              placeholder="Article Content"
              value={content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
              required
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Mint Price (ETH)"
              value={mintPrice}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMintPrice(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={isPending || isConfirming || !address} className="mt-4">
            {isPending ? 'Creating...' : isConfirming ? 'Confirming...' : 'Create Article'}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        {isSuccess && (
          <p className="text-green-600">Article created successfully!</p>
        )}
        {writeError && (
          <p className="text-red-600">Error occurred. Please check console for details.</p>
        )}
      </CardFooter>
    </Card>
  );
};

export default CreateArticle;