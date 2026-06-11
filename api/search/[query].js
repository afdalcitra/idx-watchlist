import { yahooFinance, setCorsHeaders } from "../_yahoo.js";

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "query required" });

  try {
    const data = await yahooFinance.search(query, {
      quotesCount: 10,
      newsCount: 0,
      enableFuzzyQuery: false,
    });

    const quotes = (data?.quotes || [])
      .filter((q) => q.exchange === "JKT" || q.symbol?.includes(".JK"))
      .map((q) => ({
        symbol: q.symbol,
        shortname: q.shortname || q.longname,
        exchange: q.exchange,
      }));

    res.status(200).json({ quotes });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
