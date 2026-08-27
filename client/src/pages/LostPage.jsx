import { Link } from 'react-router-dom';
import { useReports } from '../hooks/useReports';
import { ReportCard } from '../components/ReportCard/ReportCard';
import { Loading, EmptyState, ErrorState } from '../components/ui/States';

export const LostPage = () => {
  const { reports, loading, loadingMore, error, hasMore, loadMore, refresh } = useReports('LOST');

  if (loading && reports.length === 0) return <Loading fullscreen />;
  if (error && reports.length === 0) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lost Items</h1>
          <p className="text-gray-500 mt-2">Help others find what they've lost around campus.</p>
        </div>
        <Link 
          to="/reports/create?type=LOST"
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm inline-block"
        >
          + Report Lost
        </Link>
      </div>

      {reports.length === 0 ? (
        <EmptyState message="No lost items reported yet." />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {reports.map(report => (
              <ReportCard key={report._id} report={report} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button 
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

