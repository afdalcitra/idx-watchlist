// api/_yahoo.js
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export function toSymbol(ticker) {
  const t = ticker.toUpperCase();
  return t.includes(".JK") ? t : `${t}.JK`;
}

export function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export { yahooFinance };
