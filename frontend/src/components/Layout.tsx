import React, { ReactNode } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200">
      <header className="p-4 bg-white shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">Prism</h1>
          <ConnectButton />
        </div>
      </header>
      <main className="container mx-auto mt-8 p-4">
        {children}
      </main>
      <footer className="mt-16 p-4 bg-indigo-900 text-white text-center">
        <p>&copy; 2024 Prism. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;