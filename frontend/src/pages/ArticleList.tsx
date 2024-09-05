import React from 'react';
import { useReadContract } from 'wagmi';
import { Loader2 } from 'lucide-react';
import { prismAbi } from '../../Contract/prism';
import ArticleCard from '../components/Article/ArticleCard';
import { useToast } from '@/components/ui/use-toast';
import { useAccount } from 'wagmi';
import { useContractAddress } from '../utils/contracts';

const ArticleList: React.FC = () => {
  const { address } = useAccount();
  const { toast } = useToast();
  const contractAddress = useContractAddress();

  const { data: allArticles, isLoading: isLoadingArticles, error: readError } = useReadContract({
    address: contractAddress,
    abi: prismAbi,
    functionName: 'listAllArticles',
  });

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
          address={address}
          toast={toast}
        />
      ))}
    </div>
  );
};

export default ArticleList;