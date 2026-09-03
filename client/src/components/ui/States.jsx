import { Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const Loading = ({ fullscreen = false }) => {
  const { isDark } = useTheme();

  if (fullscreen) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[60vh] bg-transparent">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className={`h-10 w-10 animate-spin ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
          <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading items...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-12 bg-transparent">
      <Loader2 className={`h-8 w-8 animate-spin ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
    </div>
  );
};

export const EmptyState = ({ message = "No items found." }) => {
  const { isDark } = useTheme();

  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl border transition-colors ${
      isDark ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-white/80 border-slate-200 text-slate-600'
    }`}>
      <p className="text-lg font-medium">{message}</p>
    </div>
  );
};

export const ErrorState = ({ message = "Something went wrong.", onRetry }) => {
  const { isDark } = useTheme();

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl border ${
      isDark ? 'bg-red-950/20 border-red-500/30' : 'bg-red-50 border-red-200'
    }`}>
      <p className="text-red-500 font-semibold mb-4">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
