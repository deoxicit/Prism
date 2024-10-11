import React, { useState } from 'react';
import { useReadContract } from 'wagmi';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { prismAbi } from '../../Contract/prism';
import ArticleCard from '../components/Article/ArticleCard';
import { useToast } from '@/components/ui/use-toast';
import { useAccount } from 'wagmi';
import { useContractAddress } from '../utils/contracts';
import { Button } from '@/components/ui/button';

const ARTICLES_PER_PAGE = 21;

const ArticleList: React.FC = () => {
  const { address } = useAccount();
  const { toast } = useToast();
  const contractAddress = useContractAddress();
  const [currentPage, setCurrentPage] = useState(1);

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

  const totalPages = allArticles ? Math.ceil(allArticles.length / ARTICLES_PER_PAGE) : 0;
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const endIndex = startIndex + ARTICLES_PER_PAGE;
  const currentArticles = allArticles ? allArticles.slice(startIndex, endIndex) : [];

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentArticles.map((tokenId) => (
          <ArticleCard
            key={tokenId.toString()}
            tokenId={tokenId}
            address={address}
            toast={toast}
          />
        ))}
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <Button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          variant="outline"
          size="sm"
        >
          <ChevronLeft className="h-4 w-4 mr-2" /> Previous
        </Button>
        <span>Page {currentPage} of {totalPages}</span>
        <Button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          variant="outline"
          size="sm"
        >
          Next <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default ArticleList;