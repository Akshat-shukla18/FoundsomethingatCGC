import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';
import { ReportCard } from '../components/ReportCard/ReportCard';
import { SearchBar } from '../components/SearchBar/SearchBar';
import { Loading, EmptyState, ErrorState } from '../components/ui/States';
import { useTheme } from '../context/ThemeContext';
import { AutobotWidget } from '../components/Autobot/AutobotWidget';
import { authService } from '../services/auth.service';

export const FoundPage = () => {
  const { results, loading, loadingMore, error, hasMore, loadMore, search } = useSearch();
  const { isDark } = useTheme();

  // Auth user state
  const [user, setUser] = useState(null);

  useEffect(() => {
    search({});

    const fetchUser = async () => {
      try {
        const data = await authService.getMe();
        setUser(data?.user || data);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <div className="space-y-2">
            <h1 
              className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${
                isDark 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-200' 
                  : 'text-slate-900'
              }`}
            >
              Found Items
            </h1>
            <p className={`text-lg font-medium ${isDark ? 'text-indigo-200/60' : 'text-slate-500'}`}>
              Search for items that have been found around campus.
            </p>
          </div>
          
          <Link 
            to="/reports/create?type=FOUND"
            className={`relative group flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              isDark 
                ? 'bg-indigo-600 border border-indigo-400/30 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)]' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg'
            }`}
          >
            <span className="text-xl leading-none">+</span>
            <span>Report Found</span>
          </Link>
        </div>

        {/* Search Bar Wrapper */}
        <div 
          className={`mb-8 p-3 md:p-4 rounded-3xl backdrop-blur-xl border transition-all duration-300 ${
            isDark 
              ? 'bg-slate-900/60 border-slate-800/60 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]' 
              : 'bg-white/70 border-slate-200/60 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]'
          }`}
        >
          <SearchBar onSearch={search} />
        </div>

        {loading && results.length > 0 && (
          <div className={`mb-6 flex items-center gap-3 animate-pulse font-medium ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>
            <div className="w-2 h-2 rounded-full bg-current animate-bounce"></div>
            <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <span className="ml-2">Updating results...</span>
          </div>
        )}

        {/* Content Area */}
        {loading && results.length === 0 ? (
          <Loading />
        ) : error && results.length === 0 ? (
          <ErrorState message={error} onRetry={() => search({})} />
        ) : results.length === 0 ? (
          <div className={`p-8 rounded-2xl border backdrop-blur-md transition-colors ${
            isDark ? 'border-indigo-900/30 bg-black/20' : 'border-slate-200 bg-white'
          }`}>
            <EmptyState message="No found items match your search." />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((report) => (
                <div 
                  key={report._id}
                  className="group transform transition-all duration-300 hover:-translate-y-1.5"
                >
                  <div className={`h-full rounded-2xl transition-all duration-300 ${
                    isDark 
                      ? 'border border-slate-800 bg-gradient-to-b from-slate-900/80 to-black hover:border-indigo-500/50 hover:shadow-[0_10px_40px_-10px_rgba(79,70,229,0.3)]' 
                      : 'hover:shadow-xl'
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
                  className={`group relative flex items-center justify-center min-w-[200px] px-8 py-3 rounded-full font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 cursor-pointer ${
                    isDark 
                      ? 'border border-indigo-500/30 text-indigo-300 bg-indigo-950/20 hover:bg-indigo-900/40 hover:border-indigo-400 hover:text-white hover:shadow-[0_0_20px_rgba(79,70,229,0.25)]' 
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-100 hover:shadow-md'
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
                    'Load More Results'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sticky Autobot Assistant Widget for Logged-In Users */}
      <AutobotWidget user={user} />
    </div>
  );
};