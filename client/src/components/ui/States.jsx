import { Loader2 } from 'lucide-react';

export const Loading = ({ fullscreen = false }) => {
  const containerClasses = fullscreen 
    ? "flex items-center justify-center min-h-screen bg-gray-50"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export const EmptyState = ({ message = "No items found." }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-lg border border-gray-200">
    <p className="text-gray-500 text-lg">{message}</p>
  </div>
);

export const ErrorState = ({ message = "Something went wrong.", onRetry }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-lg border border-red-200">
    <p className="text-red-600 font-medium mb-4">{message}</p>
    {onRetry && (
      <button 
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
);

