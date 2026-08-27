import { useEffect } from 'react';
import { useSearch } from '../hooks/useSearch';
import { ReportCard } from '../components/ReportCard/ReportCard';
import { SearchBar } from '../components/SearchBar/SearchBar';
import { Loading, EmptyState, ErrorState } from '../components/ui/States';

export const FoundPage = () => {
  const { results, loading, loadingMore, error, hasMore, loadMore, search } = useSearch();

  // Run empty search on initial mount to load the default feed
  useEffect(() => {
    search({});
  }, [search]);

  if (loading && results.length === 0) return <Loading fullscreen />;
  
  // if error on initial load (with no results), show ErrorState
  if (error && results.length === 0) return <ErrorState message={error} onRetry={() => search({})} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Found Items</h1>
          <p className="text-gray-500 mt-2">Search for items that have been found around campus.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
          + Report Found
        </button>
      </div>

      <SearchBar onSearch={search} />

      {loading && results.length > 0 && (
        <div className="mb-4 text-gray-500 animate-pulse">Updating results...</div>
      )}

      {results.length === 0 && !loading ? (
        <EmptyState message="No found items match your search." />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map(report => (
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
