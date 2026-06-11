import { yahooFinance, toSymbol, setCorsHeaders } from "../_yahoo.js";

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const { ticker } = req.query;
  if (!ticker) return res.status(400).json({ error: "ticker required" });

  try {
    const symbol = toSymbol(ticker);

    const [quoteResult, summaryResult] = await Promise.allSettled([
      yahooFinance.quote(symbol),
      yahooFinance.quoteSummary(symbol, {
        modules: [
          "price",
          "summaryDetail",
          "defaultKeyStatistics",
          "incomeStatementHistory",
        ],
      }),
    ]);

    const q = quoteResult.status === "fulfilled" ? quoteResult.value : {};
    const qs = summaryResult.status === "fulfilled" ? summaryResult.value : {};

    const priceModule = qs?.price || {};
    const summaryModule = qs?.summaryDetail || {};
    const keyStats = qs?.defaultKeyStatistics || {};
    const incomeHistory =
      qs?.incomeStatementHistory?.incomeStatementHistory || [];

    const latestIncome = incomeHistory[0] || {};
    const revenue = latestIncome.totalRevenue ?? null;
    const netIncome = latestIncome.netIncome ?? null;
    const netMargin = revenue && netIncome ? (netIncome / revenue) * 100 : null;

    const price =
      priceModule.regularMarketPrice ?? q.regularMarketPrice ?? null;
    const prevClose =
      priceModule.regularMarketPreviousClose ??
      q.regularMarketPreviousClose ??
      null;
    const change =
      priceModule.regularMarketChange ?? q.regularMarketChange ?? null;
    const changePct =
      priceModule.regularMarketChangePercent ??
      q.regularMarketChangePercent ??
      null;

    res.status(200).json({
      ticker: symbol,
      shortName: priceModule.shortName || q.shortName || symbol,
      longName: priceModule.longName || q.longName || symbol,
      regularMarketPrice: price,
      regularMarketChange: change,
      regularMarketChangePercent: changePct,
      previousClose: prevClose,
      currency: q.currency || "IDR",
      marketCap: priceModule.marketCap ?? q.marketCap ?? null,
      trailingPE:
        summaryModule.trailingPE ?? keyStats.trailingPE ?? q.trailingPE ?? null,
      priceToBook: keyStats.priceToBook ?? q.priceToBook ?? null,
      trailingEps: keyStats.trailingEps ?? q.epsTrailingTwelveMonths ?? null,
      revenue,
      netIncome,
      netMargin,
      fiftyTwoWeekHigh:
        summaryModule.fiftyTwoWeekHigh ?? q.fiftyTwoWeekHigh ?? null,
      fiftyTwoWeekLow:
        summaryModule.fiftyTwoWeekLow ?? q.fiftyTwoWeekLow ?? null,
      averageVolume:
        summaryModule.averageVolume ?? q.averageDailyVolume3Month ?? null,
    });
  } catch (e) {
    console.error("[summary]", e.message);
    res.status(500).json({ error: e.message });
  }
}
