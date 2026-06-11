import { yahooFinance, toSymbol, setCorsHeaders } from "../_yahoo.js";

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const { ticker } = req.query;
  if (!ticker) return res.status(400).json({ error: "ticker required" });

  try {
    const symbol = toSymbol(ticker);

    const data = await yahooFinance.chart(symbol, {
      interval: "1d",
      range: "20y",
      events: "dividends",
    });

    const events = data?.events?.dividends || {}; // ← path berbeda dari v8 raw
    const currentPrice = data?.meta?.regularMarketPrice;

    const dividends = Object.values(events)
      .map((d) => ({ date: d.date * 1000, amount: d.amount }))
      .sort((a, b) => b.date - a.date);

    if (dividends.length === 0) {
      return res.status(200).json({ dividends: [], byYear: {}, stats: null });
    }

    const byYear = {};
    dividends.forEach((d) => {
      const year = new Date(d.date).getFullYear();
      byYear[year] = (byYear[year] || 0) + d.amount;
    });

    const now = new Date();
    const thisYear = now.getFullYear();
    const lastYear = thisYear - 1;

    const sumLastYear = byYear[lastYear] || 0;
    const sumThisYear = byYear[thisYear] || 0;

    const ttmCutoff = now.getTime() - 365 * 24 * 60 * 60 * 1000;
    const ttmSum = dividends
      .filter((d) => d.date >= ttmCutoff)
      .reduce((s, d) => s + d.amount, 0);

    const years5 = [
      lastYear,
      thisYear - 2,
      thisYear - 3,
      thisYear - 4,
      thisYear - 5,
    ];
    const avg5 = years5.reduce((s, y) => s + (byYear[y] || 0), 0) / 5;

    const yieldCalc = (amount) =>
      currentPrice ? (amount / currentPrice) * 100 : null;

    res.status(200).json({
      dividends,
      byYear,
      stats: {
        currentPrice,
        lastYearTotal: sumLastYear,
        lastYearYield: yieldCalc(sumLastYear),
        thisYearTotal: sumThisYear,
        thisYearYield: yieldCalc(sumThisYear),
        ttmTotal: ttmSum,
        ttmYield: yieldCalc(ttmSum),
        avg5Year: avg5,
        avg5YearYield: yieldCalc(avg5),
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
