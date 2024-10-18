import React, { ErrorInfo, ReactNode } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import CreateArticle from "./pages/CreateArticle";
import ArticleList from "./pages/ArticleList";
import ArticleDetailPage from "./pages/ArticleDetailPage";
import About from "./pages/About";
import { Toaster } from "@/components/ui/toaster";
import MaintenancePage from "./pages/MaintanenceMode";

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
  console.log("Rendering App component");
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<MaintenancePage />} />
        </Routes>
        {/* <Layout>
          <Routes>
            <Route path="/" element={<ArticleList />} />
            <Route path="/articles" element={<ArticleList />} />
            <Route path="/article/:tokenId" element={<ArticleDetailPage />} />
            <Route path="/create" element={<CreateArticle />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Layout> */}
        <Toaster />
      </Router>
    </ErrorBoundary>
  );
};

export default App;
