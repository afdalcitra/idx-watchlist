import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPrice, formatPercent, changeClass, stripJK } from '../utils/format';
import './StockCard.css';

export default function StockCard({ ticker, data, onRemove }) {
  const navigate = useNavigate();

  if (!data) {
    return (
      <div className="stock-card stock-card--loading">
        <div className="stock-card__left">
          <div className="skeleton" style={{ width: 56, height: 18, marginBottom: 6 }} />
          <div className="skeleton" style={{ width: 120, height: 13 }} />
        </div>
        <div className="stock-card__right">
          <div className="skeleton" style={{ width: 80, height: 18, marginBottom: 6 }} />
          <div className="skeleton" style={{ width: 52, height: 24 }} />
        </div>
      </div>
    );
  }

  const changeVal = data.regularMarketChangePercent;
  const cls = changeClass(changeVal);

  return (
    <div
      className="stock-card fade-in"
      onClick={() => navigate(`/stock/${encodeURIComponent(ticker)}`)}
    >
      <div className="stock-card__left">
        <span className="stock-card__ticker">{stripJK(ticker)}</span>
        <span className="stock-card__name">{data.shortName}</span>
      </div>
      <div className="stock-card__right">
        <span className="stock-card__price mono">
          {formatPrice(data.regularMarketPrice, data.currency)}
        </span>
        <span className={`stock-card__change ${cls}`}>
          {formatPercent(changeVal)}
        </span>
      </div>
    </div>
  );
}
