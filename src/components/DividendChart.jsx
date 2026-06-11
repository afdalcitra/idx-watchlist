import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatPrice } from '../utils/format';
import './DividendChart.css';

const GOLD = '#F0B429';
const GOLD_DIM = 'rgba(240,180,41,0.35)';

export default function DividendChart({ byYear, currency }) {
  const currentYear = new Date().getFullYear();
  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => a - b)
    .slice(-10); // last 10 years

  const chartData = years.map(y => ({
    year: String(y),
    amount: byYear[y] || 0,
    isRecent: y >= currentYear - 1,
  }));

  if (chartData.length === 0) return null;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip__year">{label}</p>
        <p className="chart-tooltip__val">{formatPrice(payload[0].value, currency)}</p>
      </div>
    );
  };

  return (
    <div className="dividend-chart-wrap">
      <h3 className="section-title" style={{ margin: '16px 0 10px' }}>Dividen per Tahun</h3>
      <div className="dividend-chart-card">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} barCategoryGap="30%">
            <XAxis
              dataKey="year"
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.isRecent ? GOLD : GOLD_DIM}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
