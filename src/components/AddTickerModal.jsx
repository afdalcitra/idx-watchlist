import React, { useState } from 'react';
import { useSearch } from '../hooks/useStockData';
import { useWatchlist } from '../context/WatchlistContext';
import { stripJK } from '../utils/format';
import './AddTickerModal.css';

export default function AddTickerModal({ onClose }) {
  const [query, setQuery] = useState('');
  const { results, loading } = useSearch(query);
  const { addTicker, isWatched } = useWatchlist();

  const handleAdd = (symbol) => {
    addTicker(symbol);
    onClose();
  };

  const handleManual = (e) => {
    e.preventDefault();
    if (query.trim()) {
      addTicker(query.trim());
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet slide-up" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <span className="modal-title">Tambah Saham</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form className="modal-search-form" onSubmit={handleManual}>
          <div className="modal-search-wrap">
            <span className="modal-search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <input
              className="modal-search-input"
              type="text"
              placeholder="Cari ticker atau nama (mis. BBCA, Bank Central)"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          {query.trim() && (
            <button type="submit" className="modal-manual-add">
              Tambah "{query.trim().toUpperCase()}" manual
            </button>
          )}
        </form>

        <div className="modal-results">
          {loading && (
            <div className="modal-loading">Mencari...</div>
          )}
          {!loading && results.length === 0 && query.length >= 2 && (
            <div className="modal-empty">Tidak ditemukan. Coba masukkan kode ticker langsung.</div>
          )}
          {results.map(r => (
            <button
              key={r.symbol}
              className={`modal-result-item ${isWatched(r.symbol) ? 'already-watched' : ''}`}
              onClick={() => handleAdd(r.symbol)}
              disabled={isWatched(r.symbol)}
            >
              <div className="modal-result-left">
                <span className="modal-result-ticker mono">{stripJK(r.symbol)}</span>
                <span className="modal-result-name">{r.shortname}</span>
              </div>
              {isWatched(r.symbol) ? (
                <span className="modal-result-tag">Sudah ada</span>
              ) : (
                <span className="modal-result-add">+ Tambah</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
