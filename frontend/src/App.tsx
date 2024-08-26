import React, { ErrorInfo, ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Layout from './components/Layout';
import CreateArticle from './components/CreateArticle';
import ArticleList from './components/ArticleList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

class ErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Error: {this.state.error?.message}</h1>;
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  console.log('Rendering App component');
  const { isConnected } = useAccount();
  
  return (
    <ErrorBoundary>
      <Layout>
        <div className="flex justify-end mb-4">
          <ConnectButton />
        </div>
        {isConnected ? (
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Article</TabsTrigger>
              <TabsTrigger value="browse">Browse Articles</TabsTrigger>
            </TabsList>
            <TabsContent value="create">
              <CreateArticle />
            </TabsContent>
            <TabsContent value="browse">
              <ArticleList />
            </TabsContent>
          </Tabs>
        ) : (
          <p>Please connect your wallet to use the application.</p>
        )}
      </Layout>
    </ErrorBoundary>
  );
};

export default App;