// api/_yahoo.js
import yahooFinance from "yahoo-finance2";

yahooFinance.setGlobalConfig({
  logger: { error: () => {}, warn: () => {}, info: () => {}, debug: () => {} },
});

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
