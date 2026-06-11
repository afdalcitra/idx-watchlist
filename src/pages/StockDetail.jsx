import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStockSummary, useDividends } from '../hooks/useStockData';
import { useWatchlist } from '../context/WatchlistContext';
import {
  formatPrice, formatPercent, formatLargeNumber,
  formatRatio, formatDate, changeClass, stripJK
} from '../utils/format';
import DividendChart from '../components/DividendChart';
import './StockDetail.css';

export default function StockDetail() {
  const { ticker } = useParams();
  const navigate = useNavigate();
  const { isWatched, addTicker, removeTicker } = useWatchlist();
  const { data, loading, error, refetch } = useStockSummary(ticker);
  const { data: divData, loading: divLoading } = useDividends(ticker);
  const [activeTab, setActiveTab] = useState('overview');

  const watched = isWatched(ticker);

  if (loading && !data) {
    return <LoadingState onBack={() => navigate(-1)} ticker={ticker} />;
  }

  if (error) {
    return <ErrorState error={error} onBack={() => navigate(-1)} onRetry={refetch} />;
  }

  const cls = data ? changeClass(data.regularMarketChangePercent) : 'neutral';
  const divStats = divData?.stats;

  return (
    <div className="detail-page">
      {/* Header */}
      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div className="detail-header__info">
          <span className="detail-ticker">{stripJK(ticker)}</span>
          <span className="detail-exchange">IDX</span>
        </div>
        <button
          className={`detail-watch-btn ${watched ? 'detail-watch-btn--active' : ''}`}
          onClick={() => watched ? removeTicker(ticker) : addTicker(ticker)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24"
            fill={watched ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>

      {/* Price Hero */}
      {data && (
        <div className="detail-hero">
          <p className="detail-company-name">{data.longName}</p>
          <div className="detail-price-row">
            <span className="detail-price mono">{formatPrice(data.regularMarketPrice, data.currency)}</span>
            <div className={`detail-change ${cls}`}>
              <span>{formatPercent(data.regularMarketChangePercent)}</span>
            </div>
          </div>
          <p className="detail-prev-close">
            Prev. close: <span className="mono">{formatPrice(data.previousClose, data.currency)}</span>
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="detail-tabs">
        {['overview', 'dividen', 'finansial'].map(tab => (
          <button
            key={tab}
            className={`detail-tab ${activeTab === tab ? 'detail-tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="detail-content">
        {activeTab === 'overview' && data && (
          <OverviewTab data={data} />
        )}
        {activeTab === 'dividen' && (
          <DividenTab divData={divData} divLoading={divLoading} currency={data?.currency} />
        )}
        {activeTab === 'finansial' && data && (
          <FinansialTab data={data} />
        )}
      </div>
    </div>
  );
}

/* ── OVERVIEW TAB ── */
function OverviewTab({ data }) {
  return (
    <div className="tab-content fade-in">
      <SectionTitle>Valuasi</SectionTitle>
      <div className="metric-grid">
        <MetricCard label="P/E Ratio" value={formatRatio(data.trailingPE)} hint="Price to Earnings" />
        <MetricCard label="PBV" value={formatRatio(data.priceToBook)} hint="Price to Book Value" />
        <MetricCard label="EPS" value={data.trailingEps != null ? formatPrice(data.trailingEps, data.currency) : '—'} hint="Earnings per Share" />
        <MetricCard label="Mkt. Cap" value={formatLargeNumber(data.marketCap, data.currency)} />
      </div>

      <SectionTitle>Range Harga</SectionTitle>
      <div className="range-card">
        <RangeBar
          low={data.fiftyTwoWeekLow}
          high={data.fiftyTwoWeekHigh}
          current={data.regularMarketPrice}
          currency={data.currency}
        />
      </div>

      <SectionTitle>Volume</SectionTitle>
      <div className="metric-grid">
        <MetricCard label="Avg. Volume" value={data.averageVolume ? data.averageVolume.toLocaleString('id-ID') : '—'} />
      </div>
    </div>
  );
}

/* ── DIVIDEN TAB ── */
function DividenTab({ divData, divLoading, currency }) {
  if (divLoading) return <div className="tab-loading">Memuat data dividen...</div>;
  if (!divData) return <div className="tab-empty">Gagal memuat data dividen.</div>;

  const { dividends, byYear, stats } = divData;
  const hasDividends = dividends && dividends.length > 0;

  return (
    <div className="tab-content fade-in">
      {!hasDividends ? (
        <div className="tab-empty">Tidak ada riwayat dividen untuk saham ini.</div>
      ) : (
        <>
          <SectionTitle>Yield Dividen</SectionTitle>
          <div className="metric-grid">
            <MetricCard
              label="Yield TTM"
              value={formatPercent(stats?.ttmYield, false)}
              valueClass={stats?.ttmYield > 0 ? 'positive' : 'neutral'}
              hint="12 bulan terakhir"
            />
            <MetricCard
              label={`Yield ${new Date().getFullYear()}`}
              value={formatPercent(stats?.thisYearYield, false)}
              valueClass={stats?.thisYearYield > 0 ? 'positive' : 'neutral'}
              hint="Tahun ini"
            />
            <MetricCard
              label={`Yield ${new Date().getFullYear() - 1}`}
              value={formatPercent(stats?.lastYearYield, false)}
              valueClass={stats?.lastYearYield > 0 ? 'positive' : 'neutral'}
              hint="Tahun lalu"
            />
            <MetricCard
              label="Yield 5Y Avg"
              value={formatPercent(stats?.avg5YearYield, false)}
              valueClass={stats?.avg5YearYield > 0 ? 'positive' : 'neutral'}
              hint="Rata-rata 5 tahun"
            />
          </div>

          <SectionTitle>Total Dividen per Tahun</SectionTitle>
          <div className="metric-grid">
            <MetricCard
              label="Total TTM"
              value={formatPrice(stats?.ttmTotal, currency)}
              hint="12 bulan terakhir"
            />
            <MetricCard
              label={`Total ${new Date().getFullYear()}`}
              value={formatPrice(stats?.thisYearTotal, currency)}
            />
            <MetricCard
              label={`Total ${new Date().getFullYear() - 1}`}
              value={formatPrice(stats?.lastYearTotal, currency)}
            />
            <MetricCard
              label="Avg 5 Tahun"
              value={formatPrice(stats?.avg5Year, currency)}
            />
          </div>

          {byYear && <DividendChart byYear={byYear} currency={currency} />}

          <SectionTitle>Riwayat Pembayaran</SectionTitle>
          <div className="dividend-history">
            {dividends.map((d, i) => (
              <div key={i} className="dividend-row">
                <span className="dividend-date">{formatDate(d.date)}</span>
                <span className="dividend-amount mono positive">
                  +{formatPrice(d.amount, currency)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── FINANSIAL TAB ── */
function FinansialTab({ data }) {
  return (
    <div className="tab-content fade-in">
      <SectionTitle>Laporan Keuangan (Tahunan Terakhir)</SectionTitle>
      <div className="metric-grid">
        <MetricCard
          label="Revenue"
          value={formatLargeNumber(data.revenue, data.currency)}
          hint="Total pendapatan"
        />
        <MetricCard
          label="Net Income"
          value={formatLargeNumber(data.netIncome, data.currency)}
          hint="Laba bersih"
          valueClass={data.netIncome > 0 ? 'positive' : data.netIncome < 0 ? 'negative' : 'neutral'}
        />
        <MetricCard
          label="Net Margin"
          value={data.netMargin != null ? `${data.netMargin.toFixed(1)}%` : '—'}
          hint="Laba / Pendapatan"
          valueClass={data.netMargin > 0 ? 'positive' : data.netMargin < 0 ? 'negative' : 'neutral'}
        />
        <MetricCard label="EPS" value={data.trailingEps != null ? formatPrice(data.trailingEps, data.currency) : '—'} />
      </div>
    </div>
  );
}

/* ── HELPER COMPONENTS ── */
function SectionTitle({ children }) {
  return <h3 className="section-title">{children}</h3>;
}

function MetricCard({ label, value, hint, valueClass }) {
  return (
    <div className="metric-card">
      <span className="metric-label">{label}</span>
      <span className={`metric-value mono ${valueClass || ''}`}>{value}</span>
      {hint && <span className="metric-hint">{hint}</span>}
    </div>
  );
}

function RangeBar({ low, high, current, currency }) {
  const pct = low != null && high != null && high > low
    ? ((current - low) / (high - low)) * 100
    : null;

  return (
    <div className="range-bar-wrap">
      <div className="range-bar-labels">
        <span className="mono negative">{formatPrice(low, currency)}</span>
        <span className="range-bar-title">52 Minggu</span>
        <span className="mono positive">{formatPrice(high, currency)}</span>
      </div>
      <div className="range-bar-track">
        <div className="range-bar-fill" style={{ width: `${Math.min(100, Math.max(0, pct || 0))}%` }} />
        {pct != null && (
          <div className="range-bar-dot" style={{ left: `${Math.min(100, Math.max(0, pct))}%` }} />
        )}
      </div>
      <div className="range-bar-current">
        <span className="mono">{formatPrice(current, currency)}</span>
        {pct != null && <span className="range-bar-pct">{pct.toFixed(0)}% dari terendah</span>}
      </div>
    </div>
  );
}

function LoadingState({ onBack, ticker }) {
  return (
    <div className="detail-page">
      <div className="detail-header">
        <button className="detail-back" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <span className="detail-ticker">{stripJK(ticker)}</span>
        <div style={{ width: 36 }} />
      </div>
      <div className="detail-hero">
        <div className="skeleton" style={{ width: 180, height: 15, marginBottom: 12 }} />
        <div className="skeleton" style={{ width: 140, height: 32, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: 80, height: 22 }} />
      </div>
    </div>
  );
}

function ErrorState({ error, onBack, onRetry }) {
  return (
    <div className="detail-page">
      <div className="detail-header">
        <button className="detail-back" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
      </div>
      <div className="error-state">
        <p>⚠️ Gagal memuat data</p>
        <p className="error-msg">{error}</p>
        <button className="error-retry" onClick={onRetry}>Coba Lagi</button>
      </div>
    </div>
  );
}
