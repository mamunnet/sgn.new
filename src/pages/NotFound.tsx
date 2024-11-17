import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-full">
            <AlertTriangle className="h-16 w-16 text-white" />
          </div>
        </div>
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">Page Not Found</h2>
        <p className="text-gray-200 mb-2">
          The page <span className="font-mono bg-white/10 px-2 py-1 rounded">{location.pathname}</span>
        </p>
        <p className="text-gray-200 mb-8">doesn't exist or has been moved.</p>
        
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-sm text-gray-900 rounded-lg hover:bg-white transition-colors"
        >
          <Home className="h-5 w-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
