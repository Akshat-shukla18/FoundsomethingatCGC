import { useState, useCallback } from 'react';
import { reportService } from '../services/report.service';

export const useSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [lastFilters, setLastFilters] = useState({});

  const search = useCallback(async (filters) => {
    try {
      setLoading(true);
      setError(null);
      setLastFilters(filters);
      
      const data = await reportService.searchFoundReports(filters);
      
      setResults(data.items || []);
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
    } catch (err) {
      setError(err.message || 'Failed to perform search');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !nextCursor) return;
    
    try {
      setLoadingMore(true);
      const data = await reportService.searchFoundReports({ ...lastFilters, cursor: nextCursor });
      
      setResults(prev => [...prev, ...(data.items || [])]);
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
    } catch (err) {
      console.error('Failed to load more search results', err);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, nextCursor, lastFilters]);

  return {
    results,
    loading,
    loadingMore,
    error,
    hasMore,
    search,
    loadMore
  };
};
