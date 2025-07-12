import React from 'react';
import { ShoppingBag } from 'lucide-react';

const LoadingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <ShoppingBag className="w-10 h-10 text-white" />
          </div>
          
          {/* Loading rings */}
          <div className="absolute inset-0 w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-2xl border-4 border-primary-200 animate-ping"></div>
            <div className="absolute inset-2 rounded-xl border-2 border-primary-300 animate-pulse"></div>
          </div>
        </div>

        {/* Brand name */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ReWear
        </h1>
        
        {/* Loading text */}
        <p className="text-lg text-gray-600 mb-8">
          Preparing your sustainable fashion experience...
        </p>

        {/* Loading spinner */}
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Loading percentage or progress */}
        <div className="mt-8 w-64 mx-auto">
          <div className="bg-gray-200 rounded-full h-2">
            <div className="bg-primary-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Loading amazing clothing items...</p>
        </div>

        {/* Tip or message */}
        <div className="mt-12 max-w-md mx-auto">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <p className="text-sm text-gray-700">
              💡 <strong>Tip:</strong> ReWear helps reduce textile waste by giving clothes a second life through our community exchange!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;