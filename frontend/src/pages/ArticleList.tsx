import React, { useState, useMemo } from 'react';
import { useReadContract } from 'wagmi';
import { Loader2, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { prismAbi } from '../../Contract/prism';
import ArticleCard from '../components/Article/ArticleCard';
import { useToast } from '@/components/ui/use-toast';
import { useAccount } from 'wagmi';
import { useContractAddress } from '../utils/contracts';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ARTICLES_PER_PAGE = 20;

const ArticleList: React.FC = () => {
  const { address } = useAccount();
  const { toast } = useToast();
  const contractAddress = useContractAddress();
  const [currentPage, setCurrentPage] = useState(1);

  const { data: allArticles, isLoading: isLoadingArticles, error: readError } = useReadContract({
    address: contractAddress,
    abi: prismAbi,
    functionName: 'listAllArticles'
  });

  const reversedArticles = useMemo(() => {
    if (!allArticles) return [];
    return [...allArticles].reverse();
  }, [allArticles]);

  if (isLoadingArticles) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (readError) {
    console.error('Read Contract Error:', readError);
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          There was an error loading the articles. This might be due to a large number of articles or a temporary network issue.
          Please try again later or contact support if the problem persists.
        </AlertDescription>
      </Alert>
    );
  }

  if (!allArticles || allArticles.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Articles</AlertTitle>
        <AlertDescription>
          There are currently no articles available. Check back later or be the first to publish an article!
        </AlertDescription>
      </Alert>
    );
  }

  const totalPages = Math.ceil(reversedArticles.length / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const endIndex = startIndex + ARTICLES_PER_PAGE;
  const currentArticles = reversedArticles.slice(startIndex, endIndex);

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