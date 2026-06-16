import { useState } from 'react';
import { BarChart3, PieChart } from 'lucide-react';

interface Transaction {
  id: number;
  amount: number;
  category: string;
  type: string;
  date: string;
  note: string;
}

interface FinanceChartProps {
  transactions: Transaction[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Rent: '#ef4444', // var(--color-accent-red)
  Food: '#f59e0b', // var(--color-accent-yellow)
  Entertainment: '#3b82f6', // var(--color-accent-blue)
  Utilities: '#8b5cf6', // var(--color-accent-purple)
  Other: '#64748b' // var(--color-mute)
};

export default function FinanceChart({ transactions }: FinanceChartProps) {
  const [chartType, setChartType] = useState<'donut' | 'bar'>('donut');

  const expenses = transactions.filter(t => t.type === 'EXPENSE');
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

  const categoryTotals: Record<string, number> = {
    Rent: 0,
    Food: 0,
    Entertainment: 0,
    Utilities: 0,
    Other: 0
  };

  expenses.forEach(t => {
    const cat = t.category;
    if (cat in categoryTotals) {
      categoryTotals[cat] += t.amount;
    } else {
      categoryTotals['Other'] += t.amount;
    }
  });

  const chartData = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      color: CATEGORY_COLORS[category] || CATEGORY_COLORS['Other']
    }))
    .filter(item => item.amount > 0);

  const radius = 50;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercentage = 0;

  return (
    <div className="hub-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 className="body-strong" style={{ fontSize: '16px' }}>Spending by Category</h4>
        
        <div style={{
          backgroundColor: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-hairline)',
          borderRadius: '9999px',
          padding: '3px',
          display: 'flex',
          gap: '2px'
        }}>
          <button
            onClick={() => setChartType('donut')}
            style={{
              background: chartType === 'donut' ? 'var(--color-surface)' : 'none',
              border: 'none',
              color: chartType === 'donut' ? 'var(--color-primary)' : 'var(--color-mute)',
              padding: '4px 12px',
              borderRadius: '9999px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              fontSize: '12px',
              fontWeight: 600,
              gap: '4px',
              boxShadow: chartType === 'donut' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <PieChart size={12} />
            Donut
          </button>
          <button
            onClick={() => setChartType('bar')}
            style={{
              background: chartType === 'bar' ? 'var(--color-surface)' : 'none',
              border: 'none',
              color: chartType === 'bar' ? 'var(--color-primary)' : 'var(--color-mute)',
              padding: '4px 12px',
              borderRadius: '9999px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              fontSize: '12px',
              fontWeight: 600,
              gap: '4px',
              boxShadow: chartType === 'bar' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <BarChart3 size={12} />
            Bar
          </button>
        </div>
      </div>

      {totalExpense === 0 ? (
        <div style={{
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-mute)',
          fontSize: '13px',
          border: '1px dashed var(--color-hairline-strong)',
          borderRadius: '12px'
        }}>
          No expenses recorded to build chart.
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          justifyContent: 'space-around',
          minHeight: '220px'
        }} className="chart-container-row">
          
          {/* Donut Render */}
          {chartType === 'donut' && (
            <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="150" height="150" viewBox="0 0 150 150" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="transparent"
                  stroke="var(--color-surface-elevated)"
                  strokeWidth={strokeWidth}
                />
                {chartData.map((item, idx) => {
                  const strokeDashoffset = circumference - (item.percentage / 100) * circumference;
                  const rotationOffset = (accumulatedPercentage / 100) * circumference;
                  accumulatedPercentage += item.percentage;

                  return (
                    <circle
                      key={idx}
                      cx="75"
                      cy="75"
                      r={radius}
                      fill="transparent"
                      stroke={item.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      style={{
                        transformOrigin: '75px 75px',
                        transform: `rotate(${(rotationOffset / circumference) * 360}deg)`,
                        transition: 'stroke-dashoffset 0.3s ease'
                      }}
                    />
                  );
                })}
              </svg>

              <div style={{
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                <span className="caption-sm" style={{ fontSize: '10px' }}>Total Expense</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-ink)', marginTop: '2px' }}>
                  ₹{totalExpense.toFixed(0)}
                </span>
              </div>
            </div>
          )}

          {/* Bar Chart Render */}
          {chartType === 'bar' && (
            <div style={{
              width: '100%',
              maxWidth: '360px',
              height: '150px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              padding: '0 10px',
              gap: '12px',
              borderBottom: '1px solid var(--color-hairline)'
            }}>
              {chartData.map((item, idx) => {
                const barHeight = (item.amount / Math.max(...chartData.map(d => d.amount))) * 110;
                return (
                  <div key={idx} style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    position: 'relative'
                  }}>
                    <span className="caption-sm" style={{
                      position: 'absolute',
                      top: `-${barHeight + 20}px`,
                      fontSize: '10px',
                      color: 'var(--color-ink)',
                      fontWeight: 600
                    }}>
                      ₹{item.amount.toFixed(0)}
                    </span>
                    
                    <div style={{
                      width: '100%',
                      maxWidth: '32px',
                      height: `${Math.max(barHeight, 6)}px`,
                      backgroundColor: item.color,
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.3s ease'
                    }} />

                    <span className="caption-sm" style={{
                      position: 'absolute',
                      bottom: '-22px',
                      fontSize: '10px',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.category}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Legend Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px 24px',
            width: '100%',
            maxWidth: '300px',
            marginTop: chartType === 'bar' ? '24px' : '0'
          }}>
            {chartData.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }} />
                  <span style={{ color: 'var(--color-body)' }}>{item.category}</span>
                </div>
                <span style={{ fontWeight: 600, color: 'var(--color-mute)' }}>
                  {item.percentage.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>

        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .chart-container-row {
            flex-direction: row !important;
          }
        }
      `}</style>
    </div>
  );
}
