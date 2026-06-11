import { yahooFetch, setCorsHeaders } from '../_yahoo.js';

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'query required' });

  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query`;
    const data = await yahooFetch(url, true);
    const quotes = (data?.quotes || [])
      .filter(q => q.exchange === 'JKT' || q.symbol?.includes('.JK'))
      .map(q => ({
        symbol: q.symbol,
        shortname: q.shortname || q.longname,
        exchange: q.exchange,
      }));
    res.status(200).json({ quotes });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
