import { useState, useEffect, useCallback } from 'react';
import { reportService } from '../services/report.service';

export const useReports = (type = 'LOST') => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);

  const fetchInitial = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = type === 'LOST' 
        ? await reportService.getLostReports() 
        : await reportService.getFoundReports();
      
      setReports(data.items || []);
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
    } catch (err) {
      setError(err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  }, [type]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !nextCursor) return;
    
    try {
      setLoadingMore(true);
      const data = type === 'LOST' 
        ? await reportService.getLostReports(nextCursor) 
        : await reportService.getFoundReports(nextCursor);
      
      setReports(prev => [...prev, ...(data.items || [])]);
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
    } catch (err) { 
      console.error('Failed to load more reports', err);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, nextCursor, type]);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  return {
    reports,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh: fetchInitial
  };
};

