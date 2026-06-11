export function formatPrice(val, currency = 'IDR') {
  if (val == null) return '—';
  if (currency === 'IDR') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

export function formatPercent(val, showPlus = true) {
  if (val == null) return '—';
  const sign = val > 0 && showPlus ? '+' : '';
  return `${sign}${val.toFixed(2)}%`;
}

export function formatLargeNumber(val, currency = 'IDR') {
  if (val == null) return '—';
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  const prefix = currency === 'IDR' ? 'Rp' : '$';
  if (abs >= 1e12) return `${sign}${prefix}${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}${prefix}${(abs / 1e9).toFixed(2)}M`; // Miliar
  if (abs >= 1e6) return `${sign}${prefix}${(abs / 1e6).toFixed(2)}Jt`;
  return `${sign}${prefix}${abs.toLocaleString('id-ID')}`;
}

export function formatRatio(val, decimals = 2) {
  if (val == null) return '—';
  return val.toFixed(decimals) + 'x';
}

export function formatDate(ts) {
  return new Date(ts).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

export function changeClass(val) {
  if (val == null) return 'neutral';
  return val > 0 ? 'positive' : val < 0 ? 'negative' : 'neutral';
}

export function stripJK(symbol) {
  return symbol?.replace('.JK', '') || symbol;
}
