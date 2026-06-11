import { yahooFetch, toSymbol, setCorsHeaders } from '../_yahoo.js';

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { ticker } = req.query;
  if (!ticker) return res.status(400).json({ error: 'ticker required' });

  try {
    const symbol = toSymbol(ticker);

    // v8/chart — always accessible, no crumb needed
    const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1y&includePrePost=false`;
    const chartData = await yahooFetch(chartUrl);
    const meta = chartData?.chart?.result?.[0]?.meta;
    if (!meta) return res.status(404).json({ error: 'Ticker not found' });

    // quoteSummary with crumb — richer data (P/E, PBV, EPS, financials)
    let qs = null;
    try {
      const qsUrl = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price%2CsummaryDetail%2CdefaultKeyStatistics%2CincomeStatementHistory`;
      const qsData = await yahooFetch(qsUrl, true);
      qs = qsData?.quoteSummary?.result?.[0] || null;
    } catch (_) {}

    // v7/quote — fallback for some fields
    let v7 = null;
    try {
      const v7Data = await yahooFetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`);
      v7 = v7Data?.quoteResponse?.result?.[0] || null;
    } catch (_) {}

    const priceModule = qs?.price || {};
    const summaryModule = qs?.summaryDetail || {};
    const keyStats = qs?.defaultKeyStatistics || {};
    const incomeHistory = qs?.incomeStatementHistory?.incomeStatementHistory || [];

    const latestIncome = incomeHistory[0] || {};
    const revenue = latestIncome.totalRevenue?.raw ?? null;
    const netIncome = latestIncome.netIncome?.raw ?? null;
    const netMargin = revenue && netIncome ? (netIncome / revenue) * 100 : null;

    const price = priceModule.regularMarketPrice?.raw ?? v7?.regularMarketPrice ?? meta.regularMarketPrice;
    const prevClose = priceModule.regularMarketPreviousClose?.raw ?? v7?.regularMarketPreviousClose ?? meta.previousClose ?? meta.chartPreviousClose;
    const changePct = priceModule.regularMarketChangePercent?.raw ?? v7?.regularMarketChangePercent ?? (prevClose && price ? ((price - prevClose) / prevClose) * 100 : null);
    const change = priceModule.regularMarketChange?.raw ?? v7?.regularMarketChange ?? (price && prevClose ? price - prevClose : null);

    res.status(200).json({
      ticker: symbol,
      shortName: priceModule.shortName || v7?.shortName || meta.shortName || symbol,
      longName: priceModule.longName || v7?.longName || meta.longName || meta.shortName || symbol,
      regularMarketPrice: price,
      regularMarketChange: change,
      regularMarketChangePercent: changePct,
      previousClose: prevClose,
      currency: meta.currency || 'IDR',
      marketCap: priceModule.marketCap?.raw ?? v7?.marketCap ?? null,
      trailingPE: summaryModule.trailingPE?.raw ?? keyStats.trailingPE?.raw ?? v7?.trailingPE ?? null,
      priceToBook: keyStats.priceToBook?.raw ?? v7?.priceToBook ?? null,
      trailingEps: keyStats.trailingEps?.raw ?? v7?.epsTrailingTwelveMonths ?? null,
      revenue,
      netIncome,
      netMargin,
      fiftyTwoWeekHigh: summaryModule.fiftyTwoWeekHigh?.raw ?? v7?.fiftyTwoWeekHigh ?? meta.fiftyTwoWeekHigh ?? null,
      fiftyTwoWeekLow: summaryModule.fiftyTwoWeekLow?.raw ?? v7?.fiftyTwoWeekLow ?? meta.fiftyTwoWeekLow ?? null,
      averageVolume: summaryModule.averageVolume?.raw ?? v7?.averageDailyVolume3Month ?? null,
    });
  } catch (e) {
    console.error('[summary]', e.message);
    res.status(500).json({ error: e.message });
  }
}
