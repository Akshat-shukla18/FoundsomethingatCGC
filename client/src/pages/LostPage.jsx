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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-6">
          <div className="space-y-2">
            <h1 
              className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${
                isDark 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-300' 
                  : 'text-slate-900'
              }`}
            >
              Lost Items
            </h1>
            <p className={`text-lg font-medium ${isDark ? 'text-slate-300/80' : 'text-slate-600'}`}>
              Find what you've lost and help others. Your search starts here.
            </p>
          </div>
          
          <Link 
            to="/reports/create?type=LOST"
            className="relative group flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30"
          >
            <span className="text-xl leading-none">+</span>
            <span>Report Lost</span>
          </Link>
        </div>

        {/* "We're here to help" Banner Card Section */}
        <div className={`mb-10 p-6 sm:p-8 rounded-3xl border backdrop-blur-xl transition-all duration-500 flex flex-col md:flex-row justify-between items-center gap-6 ${
          isDark 
            ? 'bg-slate-900/80 border-red-500/30 shadow-[0_0_35px_rgba(239,68,68,0.15)] text-white' 
            : 'bg-white/90 border-red-200 shadow-xl shadow-red-500/5 text-slate-900'
        }`}>
          <div className="space-y-3 max-w-2xl text-left">
            <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              We're here to help.
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Really sorry for your loss. We will try our best. Just make a report with a clear description, and we will notify you.
            </p>
          </div>

          {/* Spotlight Box SVG Graphic / Illustration Space */}
          <div className="shrink-0 relative flex items-center justify-center">
            <svg viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-36 h-36 shrink-0 drop-shadow-md">
              {/* Spotlight beam */}
              <polygon points="120,5 60,105 130,105" fill="url(#spotlightGrad)" opacity="0.35" />
              <ellipse cx="120" cy="5" rx="14" ry="7" fill="#FDE047" opacity="0.85" />
              <path d="M110 5 L120 -10 L130 5" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />

              <defs>
                <linearGradient id="spotlightGrad" x1="120" y1="5" x2="95" y2="105" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FDE047" stopOpacity="0.8" />
                  <stop offset="1" stopColor="#FDE047" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Box 3D Isometric */}
              <path d="M45 70 L95 55 L145 70 L95 85 Z" fill="#334155" />
              <path d="M45 70 L30 50 L80 35 L95 55 Z" fill="#475569" />
              <path d="M145 70 L160 50 L110 35 L95 55 Z" fill="#475569" />
              <path d="M45 70 L95 85 L95 125 L45 110 Z" fill="#1E293B" />
              <path d="M95 85 L145 70 L145 110 L95 125 Z" fill="#0F172A" />

              {/* "LOST" label */}
              <text x="54" y="98" fill="#F87171" fontSize="13" fontWeight="900" fontFamily="sans-serif" letterSpacing="1.5" transform="skewY(12)">LOST</text>
            </svg>
          </div>
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