import { useEffect, useRef, useCallback, useState } from 'react';

export function usePolling<T>(
  fetchFn: () => Promise<T> | T,
  interval: number = 10000,
  enabled: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetch = useCallback(async () => {
    try {
      const result = await fetchFn();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  const refetch = useCallback(() => {
    setLoading(true);
    fetch();
  }, [fetch]);

  useEffect(() => {
    if (!enabled) return;

    fetch();

    const poll = () => {
      timeoutRef.current = setTimeout(() => {
        fetch();
        poll();
      }, interval);
    };

    poll();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fetch, interval, enabled]);

  return { data, loading, error, refetch };
}