import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { WatchlistProvider } from './context/WatchlistContext';
import Home from './pages/Home';
import StockDetail from './pages/StockDetail';

export default function App() {
  return (
    <WatchlistProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stock/:ticker" element={<StockDetail />} />
      </Routes>
    </WatchlistProvider>
  );
}
