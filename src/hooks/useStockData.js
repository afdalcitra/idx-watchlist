import { useState, useEffect, useCallback } from 'react';

const BASE = '/api';

export function useStockSummary(ticker) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch_ = useCallback(async () => {
    if (!ticker) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE}/summary/${ticker}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal memuat data');
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { data, loading, error, refetch: fetch_ };
}

export function useDividends(ticker) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticker) return;
    setLoading(true);
    setError(null);
    fetch(`${BASE}/dividends/${ticker}`)
      .then(r => r.json())
      .then(json => { setData(json); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [ticker]);

  return { data, loading, error };
}

export function useSearch(query) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE}/search/${encodeURIComponent(query)}`);
        const json = await res.json();
        setResults(json.quotes || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  return { results, loading };
}

// Fetch multiple tickers in parallel for watchlist
export function useWatchlistData(tickers) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!tickers.length) return;
    setLoading(true);
    const results = await Promise.allSettled(
      tickers.map(t =>
        fetch(`${BASE}/summary/${t}`).then(r => r.json())
      )
    );
    const map = {};
    results.forEach((r, i) => {
      if (r.status === 'fulfilled' && !r.value.error) {
        map[tickers[i]] = r.value;
      }
    });
    setData(map);
    setLoading(false);
  }, [tickers.join(',')]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { data, loading, refetch: fetchAll };
}
