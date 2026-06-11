import React, { createContext, useContext, useState, useEffect } from 'react';

const WatchlistContext = createContext();

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem('watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const addTicker = (ticker) => {
    const symbol = ticker.toUpperCase().includes('.JK')
      ? ticker.toUpperCase()
      : `${ticker.toUpperCase()}.JK`;
    if (!watchlist.includes(symbol)) {
      setWatchlist(prev => [...prev, symbol]);
    }
  };

  const removeTicker = (ticker) => {
    setWatchlist(prev => prev.filter(t => t !== ticker));
  };

  const isWatched = (ticker) => watchlist.includes(ticker);

  return (
    <WatchlistContext.Provider value={{ watchlist, addTicker, removeTicker, isWatched }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export const useWatchlist = () => useContext(WatchlistContext);
