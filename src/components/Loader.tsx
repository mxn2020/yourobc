import React from 'react';
import { Brain } from 'lucide-react';

export function Loader() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="relative">
        {/* Main spinning circle */}
        <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin">
        </div>
        
        {/* Center logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
        </div>
        
        {/* Loading text */}
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <div className="text-sm font-medium text-gray-600 animate-pulse">
            Loading Geenius...
          </div>
        </div>
        
        {/* Subtle pulse effect */}
        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full animate-ping opacity-20"></div>
      </div>
    </div>
  );
}