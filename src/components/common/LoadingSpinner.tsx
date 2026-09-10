import React from 'react';

export default function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-gray-700 rounded-full"></div>
        <div className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin absolute top-0"></div>
      </div>
      <p className="mt-4 text-sm text-gray-500">{text}</p>
    </div>
  );
}