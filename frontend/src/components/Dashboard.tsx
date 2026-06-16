import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, Wallet, Sparkles, Plus, Trash2, 
  Calendar, Home, Utensils, Play, Activity, HelpCircle, DollarSign, Filter, RefreshCw
} from 'lucide-react';
import FinanceChart from './FinanceChart';

interface Transaction {
  id: number;
  amount: number;
  category: string;
  type: string;
  date: string;
  note: string;
}

interface Summary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  topSpendingCategory: string;
  topCategoryAmount: number;
}

interface Insight {
  title: string;
  type: string; // success, info, warning
  description: string;
}

interface DashboardProps {
  transactions: Transaction[];
  summary: Summary;
  insights: Insight[];
  categoryFilter: string;
  setCategoryFilter: (cat: string) => void;
  startDateFilter: string;
  setStartDateFilter: (date: string) => void;
  endDateFilter: string;
  setEndDateFilter: (date: string) => void;
  onAddTransaction: (t: { amount: number; category: string; type: string; date: string; note: string }) => void;
  onDeleteTransaction: (id: number) => void;
}

export function getCategoryIcon(category: string, size = 16, style = {}) {
  switch (category) {
    case 'Salary':
      return <DollarSign size={size} style={{ color: 'var(--color-accent-green)', ...style }} />;
    case 'Rent':
      return <Home size={size} style={{ color: 'var(--color-accent-red)', ...style }} />;
    case 'Food':
      return <Utensils size={size} style={{ color: 'var(--color-accent-yellow)', ...style }} />;
    case 'Entertainment':
      return <Play size={size} style={{ color: 'var(--color-accent-blue)', ...style }} />;
    case 'Utilities':
      return <Activity size={size} style={{ color: 'var(--color-accent-purple)', ...style }} />;
    default:
      return <HelpCircle size={size} style={{ color: 'var(--color-mute)', ...style }} />;
  }
}

export default function Dashboard({
  transactions,
  summary,
  insights,
  categoryFilter,
  setCategoryFilter,
  startDateFilter,
  setStartDateFilter,
  endDateFilter,
  setEndDateFilter,
  onAddTransaction,
  onDeleteTransaction
}: DashboardProps) {
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [type, setType] = useState('EXPENSE');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      window.alert("Please enter a valid amount greater than 0");
      return;
    }
    onAddTransaction({
      amount: parsedAmount,
      category: type === 'INCOME' ? 'Salary' : category,
      type,
      date,
      note
    });
    setAmount('');
    setNote('');
    setShowAddForm(false);
  };

  const handleResetFilters = () => {
    setCategoryFilter('All Categories');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  const categories = ['All Categories', 'Salary', 'Food', 'Rent', 'Entertainment', 'Utilities', 'Other'];

  return (
    <div className="container-hub dashboard-container">
      
      {/* 4-Step Summary Row */}
      <div className="summary-grid">
        {/* Total Income */}
        <div className="hub-card summary-card">
          <div className="summary-icon-box" style={{
            backgroundColor: 'var(--color-accent-green-soft)',
            color: 'var(--color-accent-green)',
            border: '1px solid rgba(16, 185, 129, 0.15)'
          }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <span className="caption-sm">Total Income</span>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-ink)', marginTop: '2px' }}>
              ₹{summary.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Total Expense */}
        <div className="hub-card summary-card">
          <div className="summary-icon-box" style={{
            backgroundColor: 'var(--color-accent-red-soft)',
            color: 'var(--color-accent-red)',
            border: '1px solid rgba(239, 68, 68, 0.15)'
          }}>
            <TrendingDown size={22} />
          </div>
          <div>
            <span className="caption-sm">Total Expenses</span>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-ink)', marginTop: '2px' }}>
              ₹{summary.totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Net Balance */}
        <div className="hub-card summary-card">
          <div className="summary-icon-box" style={{
            backgroundColor: summary.netBalance >= 0 ? 'var(--color-accent-blue-soft)' : 'var(--color-accent-red-soft)',
            color: summary.netBalance >= 0 ? 'var(--color-accent-blue)' : 'var(--color-accent-red)',
            border: '1px solid rgba(59, 130, 246, 0.15)'
          }}>
            <Wallet size={22} />
          </div>
          <div>
            <span className="caption-sm">Net Balance</span>
            <div style={{ 
              fontSize: '22px', 
              fontWeight: 700, 
              color: summary.netBalance >= 0 ? 'var(--color-accent-blue)' : 'var(--color-accent-red)',
              marginTop: '2px' 
            }}>
              ₹{summary.netBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Top Category */}
        <div className="hub-card summary-card">
          <div className="summary-icon-box" style={{
            backgroundColor: 'var(--color-accent-yellow-soft)',
            color: 'var(--color-accent-yellow)',
            border: '1px solid rgba(245, 158, 11, 0.15)'
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <span className="caption-sm">Top Spending Area</span>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-ink)', marginTop: '2px' }}>
              {summary.topSpendingCategory}
              <span className="caption-sm" style={{ fontWeight: 500, marginLeft: '6px' }}>
                (₹{summary.topCategoryAmount.toFixed(0)})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div className="main-content-layout">
        
        {/* Left Side: Ledger and Filter tools */}
        <div className="ledger-wrapper">
          
          {/* Header Controls & Tab Pills */}
          <div className="hub-card ledger-header-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <h3 className="heading-xl" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={18} />
                Transaction Ledger
              </h3>
              
              <button 
                className="btn-primary" 
                onClick={() => setShowAddForm(!showAddForm)}
                style={{ gap: '8px' }}
              >
                <Plus size={16} />
                Record Transaction
              </button>
            </div>

            {/* Form logger (Collapsible) */}
            {showAddForm && (
              <form onSubmit={handleSubmit} className="ledger-form">
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '16px'
                }}>
                  {/* Type */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="caption-md">Flow Type</label>
                    <select 
                      value={type} 
                      onChange={(e) => setType(e.target.value)}
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-charcoal)',
                        border: '1px solid var(--color-hairline-strong)',
                        borderRadius: '10px',
                        height: '40px',
                        padding: '0 10px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    >
                      <option value="EXPENSE">Expense</option>
                      <option value="INCOME">Income</option>
                    </select>
                  </div>

                  {/* Amount */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="caption-md">Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 45.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="text-input"
                      required
                    />
                  </div>

                  {/* Category */}
                  {type === 'EXPENSE' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label className="caption-md">Category</label>
                      <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          color: 'var(--color-charcoal)',
                          border: '1px solid var(--color-hairline-strong)',
                          borderRadius: '10px',
                          height: '40px',
                          padding: '0 10px',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      >
                        <option value="Food">Food</option>
                        <option value="Rent">Rent</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  )}

                  {/* Date */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="caption-md">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="text-input"
                      required
                    />
                  </div>
                </div>

                {/* Optional Note */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="caption-md">Optional Note</label>
                  <input
                    type="text"
                    placeholder="Provide details..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="text-input"
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Save Entry</button>
                </div>
              </form>
            )}

            {/* Filter pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span className="caption-sm">Filter by Category:</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {categories.map((cat) => {
                  const isActive = categoryFilter === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      style={{
                        backgroundColor: isActive ? 'var(--color-primary-start)' : 'var(--color-surface-elevated)',
                        color: isActive ? '#ffffff' : 'var(--color-charcoal)',
                        border: '1px solid ' + (isActive ? 'transparent' : 'var(--color-hairline)'),
                        fontSize: '13px',
                        fontWeight: isActive ? 600 : 500,
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s, color 0.15s'
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date range filters */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              paddingTop: '16px',
              borderTop: '1px solid var(--color-hairline)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span className="caption-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} />
                  Date Range:
                </span>
                <input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  className="text-input"
                  style={{ height: '32px', fontSize: '13px', padding: '0 8px' }}
                />
                <span className="caption-sm">to</span>
                <input
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  className="text-input"
                  style={{ height: '32px', fontSize: '13px', padding: '0 8px' }}
                />
              </div>

              {(categoryFilter !== 'All Categories' || startDateFilter || endDateFilter) && (
                <button 
                  className="btn-secondary" 
                  onClick={handleResetFilters}
                  style={{ height: '32px', fontSize: '12px', padding: '0 14px', display: 'flex', gap: '6px' }}
                >
                  <RefreshCw size={12} />
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Ledger log rows */}
          <div className="ledger-list-card">
            {transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-mute)', fontSize: '14px' }}>
                No transaction ledger logs found.
              </div>
            ) : (
              <div>
                {transactions.map((t) => (
                  <div
                    key={t.id}
                    className="ledger-row"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: t.type === 'INCOME' ? 'var(--color-accent-green-soft)' : 'var(--color-surface-elevated)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--color-hairline)'
                      }}>
                        {getCategoryIcon(t.category, 16)}
                      </div>
                      
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)' }}>
                            {t.category}
                          </span>
                          {t.note && (
                            <span className="body-sm" style={{ fontSize: '12px' }}>
                              ({t.note})
                            </span>
                          )}
                        </div>
                        <span className="caption-sm" style={{ fontSize: '12px', color: 'var(--color-mute)', marginTop: '2px', display: 'block' }}>
                          {t.date}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: t.type === 'INCOME' ? 'var(--color-accent-green)' : 'var(--color-ink)'
                      }}>
                        {t.type === 'INCOME' ? '+' : '-'}₹{t.amount.toFixed(2)}
                      </span>
                      
                      <button
                        onClick={() => onDeleteTransaction(t.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-ash)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '4px',
                          transition: 'color 0.15s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-accent-red)'}
                        onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-ash)'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Charts & Insights column */}
        <div className="right-panel-column">
          
          <FinanceChart transactions={transactions} />

          {/* Insights Card list */}
          <div className="hub-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h4 className="body-strong" style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} style={{ color: 'var(--color-accent-yellow)' }} />
              Rule-Based Observations
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {insights.map((insight, idx) => {
                const borderAccent = 
                  insight.type === 'success' ? 'var(--color-accent-green)' :
                  insight.type === 'warning' ? 'var(--color-accent-red)' : 'var(--color-accent-blue)';
                
                return (
                  <div 
                    key={idx} 
                    style={{
                      borderLeft: `4px solid ${borderAccent}`,
                      backgroundColor: 'var(--color-surface-elevated)',
                      borderTop: '1px solid var(--color-hairline)',
                      borderRight: '1px solid var(--color-hairline)',
                      borderBottom: '1px solid var(--color-hairline)',
                      padding: '14px 16px',
                      borderRadius: '0 12px 12px 0',
                    }}
                  >
                    <h5 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)' }}>
                      {insight.title}
                    </h5>
                    <p className="body-sm" style={{ marginTop: '4px', color: 'var(--color-body)', lineHeight: '1.4' }}>
                      {insight.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
