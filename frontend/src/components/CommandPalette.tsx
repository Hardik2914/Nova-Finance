import { useState, useEffect, useRef } from 'react';
import { Search, CornerDownLeft, X, Plus, RefreshCw, Sparkles } from 'lucide-react';
import { getCategoryIcon } from './Dashboard';

interface Command {
  id: string;
  name: string;
  description: string;
  hotkey: string;
}

interface CommandPaletteProps {
  onAddTransaction: (t: { amount: number; category: string; type: string; date: string; note: string }) => void;
  setCategoryFilter: (cat: string) => void;
  onClearFilters: () => void;
  savingInsight: string;
}

const COMMANDS: Command[] = [
  { id: 'add-expense', name: 'Add Expense Record', description: 'Log a new outbound expense transaction', hotkey: '⌥ E' },
  { id: 'add-income', name: 'Add Income Record', description: 'Log a new base salary or other inflow', hotkey: '⌥ I' },
  { id: 'filter-food', name: 'Filter Category: Food', description: 'Show only food and dining expenses', hotkey: '⌥ 1' },
  { id: 'filter-rent', name: 'Filter Category: Rent', description: 'Show only rent and accommodation costs', hotkey: '⌥ 2' },
  { id: 'filter-salary', name: 'Filter Category: Salary', description: 'Show only income deposits', hotkey: '⌥ 3' },
  { id: 'filter-entertainment', name: 'Filter Category: Entertainment', description: 'Show only concerts, movies, and fun', hotkey: '⌥ 4' },
  { id: 'filter-utilities', name: 'Filter Category: Utilities', description: 'Show only AWS, electric, or gas bills', hotkey: '⌥ 5' },
  { id: 'clear-filters', name: 'Clear All Filters', description: 'Reset category and date range selections', hotkey: '⌥ C' },
  { id: 'view-insight', name: 'Analyze Savings Rate Insight', description: 'Show dynamic savings rate details', hotkey: '⌥ H' },
];

export default function CommandPalette({
  onAddTransaction,
  setCategoryFilter,
  onClearFilters,
  savingInsight
}: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const inputRef = useRef<HTMLInputElement>(null);
  const dialogInputRef = useRef<HTMLInputElement>(null);

  const filtered = COMMANDS.filter(cmd =>
    cmd.name.toLowerCase().includes(query.toLowerCase()) ||
    cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        setActiveAction(null);
        setQuery('');
      }

      if (!isOpen) return;

      if (activeAction) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setActiveAction(null);
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          handleExecute(filtered[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, activeAction]);

  useEffect(() => {
    if (isOpen && !activeAction) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, activeAction]);

  useEffect(() => {
    if (activeAction) {
      setTimeout(() => dialogInputRef.current?.focus(), 50);
    }
  }, [activeAction]);

  const handleExecute = (cmd: Command) => {
    if (cmd.id === 'add-expense' || cmd.id === 'add-income') {
      setAmount('');
      setNote('');
      setCategory(cmd.id === 'add-income' ? 'Salary' : 'Food');
      setActiveAction(cmd.id);
    } else if (cmd.id.startsWith('filter-')) {
      const cat = cmd.id.replace('filter-', '');
      const categoryName = cat.charAt(0).toUpperCase() + cat.slice(1);
      setCategoryFilter(categoryName);
      setIsOpen(false);
    } else if (cmd.id === 'clear-filters') {
      onClearFilters();
      setIsOpen(false);
    } else if (cmd.id === 'view-insight') {
      setActiveAction('view-insight');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddTransaction({
      amount: parsedAmount,
      category: activeAction === 'add-income' ? 'Salary' : category,
      type: activeAction === 'add-income' ? 'INCOME' : 'EXPENSE',
      date,
      note
    });

    setActiveAction(null);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <div style={{ textAlign: 'center', marginTop: '-12px' }}>
        <button 
          className="btn-secondary"
          onClick={() => setIsOpen(true)}
          style={{
            fontSize: '12px',
            height: '32px',
            borderRadius: '9999px',
            gap: '8px',
            borderColor: 'var(--color-hairline-strong)'
          }}
        >
          <span>Focus Search</span>
          <span className="keycap" style={{ height: '16px', fontSize: '9px', padding: '0 4px' }}>Ctrl</span>
          <span className="keycap" style={{ height: '16px', fontSize: '9px', padding: '0 4px' }}>K</span>
        </button>
      </div>
    );
  }

  return (
    <div className="command-palette-backdrop">
      <div 
        className="command-palette-card"
        style={{
          width: '100%',
          maxWidth: '600px',
          borderRadius: '16px',
          overflow: 'hidden',
          margin: '0 16px'
        }}
      >
        {activeAction ? (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--color-hairline)' }}>
              <h4 className="body-strong" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                {activeAction === 'add-income' && <Plus size={16} style={{ color: 'var(--color-accent-green)' }} />}
                {activeAction === 'add-expense' && <Plus size={16} style={{ color: 'var(--color-accent-red)' }} />}
                {activeAction === 'view-insight' && <Sparkles size={16} style={{ color: 'var(--color-accent-yellow)' }} />}
                {activeAction === 'add-income' ? 'Record Income Flow' : activeAction === 'add-expense' ? 'Record Expense Flow' : 'Savings Rate Insights'}
              </h4>
              <button 
                onClick={() => setActiveAction(null)}
                style={{ background: 'none', border: 'none', color: 'var(--color-mute)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            {activeAction === 'view-insight' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '100px', justifyContent: 'center' }}>
                <p className="body-md" style={{ color: 'var(--color-charcoal)', lineHeight: '1.5', textAlign: 'center' }}>
                  {savingInsight || "No transactions recorded yet to generate savings feedback."}
                </p>
                <button className="btn-primary" onClick={() => setActiveAction(null)} style={{ alignSelf: 'center' }}>
                  Back to commands
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="caption-md">Amount (₹)</label>
                    <input
                      ref={dialogInputRef}
                      type="number"
                      step="0.01"
                      placeholder="Amount..."
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="text-input"
                      required
                    />
                  </div>

                  {activeAction === 'add-expense' ? (
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
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label className="caption-md">Category</label>
                      <input 
                        type="text" 
                        value="Salary" 
                        disabled 
                        className="text-input" 
                        style={{ backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-mute)' }} 
                      />
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
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

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setActiveAction(null)}>Back</button>
                  <button type="submit" className="btn-primary">Save Entry</button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid var(--color-hairline)',
              gap: '12px'
            }}>
              <Search size={18} style={{ color: 'var(--color-mute)' }} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search command actions..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--color-charcoal)',
                  fontSize: '15px',
                  height: '24px'
                }}
              />
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-mute)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '8px' }}>
              {filtered.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-mute)', fontSize: '13px' }}>
                  No command actions matched your query.
                </div>
              ) : (
                filtered.map((cmd, index) => {
                  const isSelected = selectedIndex === index;
                  let icon = <Plus size={14} style={{ color: 'var(--color-accent-blue)' }} />;
                  
                  if (cmd.id.startsWith('filter-')) {
                    const cat = cmd.id.replace('filter-', '');
                    const categoryName = cat.charAt(0).toUpperCase() + cat.slice(1);
                    icon = getCategoryIcon(categoryName, 14);
                  } else if (cmd.id === 'clear-filters') {
                    icon = <RefreshCw size={14} style={{ color: 'var(--color-mute)' }} />;
                  } else if (cmd.id === 'view-insight') {
                    icon = <Sparkles size={14} style={{ color: 'var(--color-accent-yellow)' }} />;
                  }

                  return (
                    <div
                      key={cmd.id}
                      onClick={() => handleExecute(cmd)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? 'var(--color-surface-elevated)' : 'transparent',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '6px',
                          backgroundColor: 'var(--color-surface)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '1px solid var(--color-hairline)'
                        }}>
                          {icon}
                        </div>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-ink)' }}>
                            {cmd.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--color-mute)', marginTop: '2px' }}>
                            {cmd.description}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="keycap" style={{ height: '18px', fontSize: '9px', padding: '0 4px' }}>
                          {cmd.hotkey}
                        </span>
                        {isSelected && <CornerDownLeft size={10} style={{ color: 'var(--color-mute)' }} />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{
              padding: '10px 20px',
              backgroundColor: 'var(--color-surface-elevated)',
              borderTop: '1px solid var(--color-hairline)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '11px',
              color: 'var(--color-mute)',
              fontWeight: 500
            }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <span>Navigate: <span className="keycap" style={{ height: '16px', fontSize: '9px', padding: '0 4px' }}>↑</span> <span className="keycap" style={{ height: '16px', fontSize: '9px', padding: '0 4px' }}>↓</span></span>
                <span>Select: <span className="keycap" style={{ height: '16px', fontSize: '9px', padding: '0 4px' }}>Enter</span></span>
              </div>
              <span>Press <span className="keycap" style={{ height: '16px', fontSize: '9px', padding: '0 4px' }}>Esc</span> to close</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
