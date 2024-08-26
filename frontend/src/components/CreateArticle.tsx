import React, { useState, FormEvent } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAccount } from 'wagmi';
import { prismAbi } from '../generated';
import { Loader2 } from 'lucide-react';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;

const CreateArticle: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [mintPrice, setMintPrice] = useState<string>('');
  const { address } = useAccount();
  const { toast } = useToast();

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create an article.",
        variant: "destructive",
      });
      return;
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: prismAbi,
        functionName: 'createArticle',
        args: [title, content, parseEther(mintPrice)],
      });
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Error",
        description: "An error occurred while creating the article. Please try again.",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Article Created",
        description: "Your article has been successfully created and minted!",
      });
      setTitle('');
      setContent('');
      setMintPrice('');
    }
  }, [isSuccess, toast]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Article</CardTitle>
        <CardDescription>Share your thoughts with the Prism community</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter a captivating title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your article content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="min-h-[200px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mintPrice">Mint Price (ETH)</Label>
            <Input
              id="mintPrice"
              type="number"
              step="0.001"
              placeholder="0.1"
              value={mintPrice}
              onChange={(e) => setMintPrice(e.target.value)}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isPending || isConfirming || !address}
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isPending ? 'Creating...' : 'Confirming...'}
              </>
            ) : (
              'Create Article'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          * Mint price is the cost for others to mint your article
        </p>
      </CardFooter>
    </Card>
  );
};

export default CreateArticle;