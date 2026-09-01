import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReports } from '../hooks/useReports';
import { ReportCard } from '../components/ReportCard/ReportCard';
import { Loading, EmptyState, ErrorState } from '../components/ui/States';
import { useTheme } from '../context/ThemeContext';

export const LostPage = () => {
  const { reports, loading, loadingMore, error, hasMore, loadMore, refresh } = useReports('LOST');
  const { isDark } = useTheme();
  
  // State to trigger the initial entry animation
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (loading && reports.length === 0) return <Loading fullscreen />;
  if (error && reports.length === 0) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <div 
      className={`min-h-screen transition-colors duration-700 ease-in-out ${
        isDark 
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/80' 
          : 'bg-gradient-to-br from-slate-50 to-red-50/40'
      }`}
    >
      <div 
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-all duration-1000 ease-out transform ${
          isMounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}
      >
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <div className="space-y-2">
            <h1 
              className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${
                isDark 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-200' 
                  : 'text-slate-900'
              }`}
            >
              Lost Items
            </h1>
            <p className={`text-lg font-medium ${isDark ? 'text-red-200/60' : 'text-slate-500'}`}>
              Help others find what they've lost around campus.
            </p>
          </div>
          
          <Link 
            to="/reports/create?type=LOST"
            className={`relative group flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              isDark 
                ? 'bg-red-600/90 border border-red-400/30 shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(248,113,113,0.6)]' 
                : 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20'
            }`}
          >
            <span className="text-xl leading-none">+</span>
            <span>Report Lost</span>
          </Link>
        </div>

        {/* Content Area */}
        {reports.length === 0 ? (
          <div className={`p-8 rounded-2xl border backdrop-blur-md transition-colors ${
            isDark ? 'border-red-900/30 bg-black/20' : 'border-slate-200 bg-white'
          }`}>
            <EmptyState message="No lost items reported yet." />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {reports.map((report, index) => (
                <div 
                  key={report._id}
                  className="group transform transition-all duration-500 ease-out hover:-translate-y-2"
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div className={`h-full rounded-2xl transition-all duration-300 ${
                    isDark 
                      ? 'border border-slate-800 bg-gradient-to-b from-slate-900/80 to-black hover:border-red-500/50 hover:shadow-[0_10px_40px_-10px_rgba(239,68,68,0.3)]' 
                      : 'hover:shadow-xl hover:shadow-red-500/10'
                  }`}>
                    <ReportCard report={report} />
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-12 flex justify-center">
                <button 
                  onClick={loadMore}
                  disabled={loadingMore}
                  className={`group relative flex items-center justify-center min-w-[200px] px-8 py-3 rounded-full font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 ${
                    isDark 
                      ? 'border border-red-500/30 text-red-300 bg-red-950/20 hover:bg-red-900/40 hover:border-red-400 hover:text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]' 
                      : 'border border-slate-300 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 hover:shadow-md'
                  }`}
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    'Load More Reports'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};