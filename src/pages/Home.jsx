import React, { useState } from 'react';
import { useWatchlist } from '../context/WatchlistContext';
import { useWatchlistData } from '../hooks/useStockData';
import StockCard from '../components/StockCard';
import AddTickerModal from '../components/AddTickerModal';
import './Home.css';

export default function Home() {
  const { watchlist, removeTicker } = useWatchlist();
  const { data, loading, refetch } = useWatchlistData(watchlist);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-header__title">
          <span className="home-header__label">Watchlist</span>
          <span className="home-header__count">{watchlist.length}</span>
        </div>
        <div className="home-header__actions">
          <button className="home-btn-refresh" onClick={refetch} title="Refresh">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
          </button>
          <button className="home-btn-add" onClick={() => setShowAdd(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah
          </button>
        </div>
      </header>

      <div className="home-content">
        {watchlist.length === 0 ? (
          <EmptyState onAdd={() => setShowAdd(true)} />
        ) : (
          <div className="stock-list">
            {watchlist.map(ticker => (
              <StockCard
                key={ticker}
                ticker={ticker}
                data={data[ticker]}
              />
            ))}
            {loading && watchlist.length > 0 && !Object.keys(data).length && (
              <div className="home-loading-text">Memuat data...</div>
            )}
          </div>
        )}
      </div>

      {showAdd && <AddTickerModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
        </svg>
      </div>
      <p className="empty-state__text">Watchlist-mu masih kosong</p>
      <p className="empty-state__sub">Tambahkan saham IDX yang ingin kamu pantau</p>
      <button className="empty-state__btn" onClick={onAdd}>
        + Tambah Saham Pertama
      </button>
    </div>
  );
}
