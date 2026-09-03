import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReports } from '../hooks/useReports';
import { ReportCard } from '../components/ReportCard/ReportCard';
import { Loading, EmptyState, ErrorState } from '../components/ui/States';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/auth.service';
import { reportService } from '../services/report.service';
import { Package, UserCheck, PlusCircle } from 'lucide-react';

export const LostPage = () => {
  const { reports, loading, loadingMore, error, hasMore, loadMore, refresh } = useReports('LOST');
  const { isDark } = useTheme();
  
  // State for tabs, user, and my reports list
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'MY_REPORTS'
  const [currentUser, setCurrentUser] = useState(null);
  const [myReports, setMyReports] = useState([]);
  const [loadingMyReports, setLoadingMyReports] = useState(false);

  useEffect(() => {
    const fetchUserAndMyReports = async () => {
      try {
        const data = await authService.getMe();
        const user = data?.user || data;
        setCurrentUser(user);
        if (user) {
          fetchMyReports();
        }
      } catch {
        setCurrentUser(null);
      }
    };
    fetchUserAndMyReports();
  }, []);

  const fetchMyReports = async () => {
    try {
      setLoadingMyReports(true);
      const res = await reportService.getMyReports('LOST');
      setMyReports(res.items || []);
    } catch {
      // fallback
    } finally {
      setLoadingMyReports(false);
    }
  };

  const handleMarkResolved = async (reportId) => {
    try {
      setMyReports(prev => prev.map(r => r._id === reportId ? { ...r, status: 'RESOLVED' } : r));
      await reportService.markResolved(reportId);
      refresh();
      fetchMyReports();
    } catch (err) {
      alert(err.message || 'Failed to mark report as resolved');
      fetchMyReports();
    }
  };

  const publicActiveReports = reports.filter(r => r.status === 'ACTIVE' || !r.status);
  const displayedReports = activeTab === 'MY_REPORTS' ? myReports : publicActiveReports;

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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

          {/* Spotlight Box SVG Graphic */}
          <div className="shrink-0 relative flex items-center justify-center">
            <svg viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-36 h-36 shrink-0 drop-shadow-md">
              <polygon points="120,5 60,105 130,105" fill="url(#spotlightGrad)" opacity="0.35" />
              <ellipse cx="120" cy="5" rx="14" ry="7" fill="#FDE047" opacity="0.85" />
              <path d="M110 5 L120 -10 L130 5" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />

              <defs>
                <linearGradient id="spotlightGrad" x1="120" y1="5" x2="95" y2="105" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FDE047" stopOpacity="0.8" />
                  <stop offset="1" stopColor="#FDE047" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <path d="M45 70 L95 55 L145 70 L95 85 Z" fill="#334155" />
              <path d="M45 70 L30 50 L80 35 L95 55 Z" fill="#475569" />
              <path d="M145 70 L160 50 L110 35 L95 55 Z" fill="#475569" />
              <path d="M45 70 L95 85 L95 125 L45 110 Z" fill="#1E293B" />
              <path d="M95 85 L145 70 L145 110 L95 125 Z" fill="#0F172A" />

              <text x="54" y="98" fill="#F87171" fontSize="13" fontWeight="900" fontFamily="sans-serif" letterSpacing="1.5" transform="skewY(12)">LOST</text>
            </svg>
          </div>
        </div>

        {/* ===== SECTION NAVIGATION TABS ===== */}
        <div className="flex flex-wrap items-center gap-3 mb-8 border-b border-gray-500/20 pb-4">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105'
                : isDark
                  ? 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:bg-slate-800'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>All Lost Items</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              activeTab === 'ALL' ? 'bg-white/20 text-white' : 'bg-red-500/10 text-red-500'
            }`}>
              {publicActiveReports.length}
            </span>
          </button>

          {currentUser && (
            <button
              onClick={() => {
                setActiveTab('MY_REPORTS');
                fetchMyReports();
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 cursor-pointer ${
                activeTab === 'MY_REPORTS'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105'
                  : isDark
                    ? 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:bg-slate-800'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>Your Reports</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                activeTab === 'MY_REPORTS' ? 'bg-white/20 text-white' : 'bg-red-500/10 text-red-500'
              }`}>
                {myReports.length}
              </span>
            </button>
          )}
        </div>

        {/* Content Area */}
        {loading && reports.length === 0 ? (
          <Loading />
        ) : error && reports.length === 0 ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : displayedReports.length === 0 ? (
          <div className={`p-10 rounded-3xl border backdrop-blur-md text-center transition-colors ${
            isDark ? 'border-red-900/30 bg-black/20 text-slate-300' : 'border-slate-200 bg-white text-slate-700'
          }`}>
            {activeTab === 'MY_REPORTS' ? (
              <div className="flex flex-col items-center space-y-4">
                <UserCheck className="h-12 w-12 text-red-500 opacity-60" />
                <h3 className="text-xl font-bold">You haven't reported any lost items yet</h3>
                <p className="text-sm text-gray-400 max-w-md">Have you misplaced something? Create a report so the campus community can help you find it.</p>
                <Link
                  to="/reports/create?type=LOST"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all transform hover:scale-105"
                >
                  <PlusCircle className="h-4 w-4" /> Create Lost Report
                </Link>
              </div>
            ) : (
              <EmptyState message="No lost items reported yet." />
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedReports.map((report) => (
                <div 
                  key={report._id}
                  className="group transform transition-all duration-300 hover:-translate-y-1.5"
                >
                  <div className={`h-full rounded-2xl transition-all duration-300 ${
                    isDark 
                      ? 'border border-slate-800 bg-gradient-to-b from-slate-900/80 to-black hover:border-red-500/50 hover:shadow-[0_10px_40px_-10px_rgba(239,68,68,0.3)]' 
                      : 'hover:shadow-xl hover:shadow-red-500/10'
                  }`}>
                    <ReportCard 
                      report={report} 
                      isOwner={activeTab === 'MY_REPORTS'} 
                      onMarkResolved={handleMarkResolved} 
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button (Only on ALL tab) */}
            {activeTab === 'ALL' && hasMore && (
              <div className="mt-12 flex justify-center">
                <button 
                  onClick={loadMore}
                  disabled={loadingMore}
                  className={`group relative flex items-center justify-center min-w-[200px] px-8 py-3 rounded-full font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 cursor-pointer ${
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