import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
import CommandPalette from './components/CommandPalette';
import Auth from './components/Auth';
import confetti from 'canvas-confetti';

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
  type: string;
  description: string;
}

interface User {
  id: number;
  email: string;
  provider: string;
}

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const TRANSACTION_API = `${BACKEND_URL}/transactions`;

const INITIAL_MOCK_TRANSACTIONS: Transaction[] = [
  { id: 101, amount: 80000.0, category: 'Salary', type: 'INCOME', date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0], note: 'Monthly base paycheck' },
  { id: 102, amount: 20000.0, category: 'Rent', type: 'EXPENSE', date: new Date(Date.now() - 13 * 86400000).toISOString().split('T')[0], note: 'Apartment rental payment' },
  { id: 103, amount: 5200.0, category: 'Food', type: 'EXPENSE', date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0], note: 'Weekly groceries' },
  { id: 104, amount: 2500.0, category: 'Food', type: 'EXPENSE', date: new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0], note: 'Dinner with friends' },
  { id: 105, amount: 3500.0, category: 'Utilities', type: 'EXPENSE', date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], note: 'AWS hosting bill' },
  { id: 106, amount: 6000.0, category: 'Entertainment', type: 'EXPENSE', date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], note: 'Concert tickets' },
  { id: 107, amount: 4200.0, category: 'Utilities', type: 'EXPENSE', date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], note: 'Electric utility bill' },
  { id: 108, amount: 450.0, category: 'Other', type: 'EXPENSE', date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], note: 'Coffee' },
];

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nova_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_MOCK_TRANSACTIONS);
  const [summary, setSummary] = useState<Summary>({
    totalIncome: 80000,
    totalExpense: 41850,
    netBalance: 38150,
    topSpendingCategory: 'Rent',
    topCategoryAmount: 20000
  });
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isSandboxMode, setIsSandboxMode] = useState(true);

  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  useEffect(() => {
    if (user) {
      localStorage.setItem('nova_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nova_user');
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
  };

  const fetchData = async () => {
    if (!user) return;
    try {
      let queryUrl = `${TRANSACTION_API}?userId=${user.id}`;
      const params = [];
      if (categoryFilter && categoryFilter !== 'All Categories') {
        params.push(`category=${encodeURIComponent(categoryFilter)}`);
      }
      if (startDateFilter) {
        params.push(`startDate=${encodeURIComponent(startDateFilter)}`);
      }
      if (endDateFilter) {
        params.push(`endDate=${encodeURIComponent(endDateFilter)}`);
      }
      if (params.length > 0) {
        queryUrl += `&${params.join('&')}`;
      }

      const resList = await fetch(queryUrl);
      if (!resList.ok) throw new Error('API server down');
      const dataList = await resList.json();
      setTransactions(dataList.data);

      const resSummary = await fetch(`${TRANSACTION_API}/summary?userId=${user.id}`);
      if (resSummary.ok) {
        const dataSummary = await resSummary.json();
        setSummary(dataSummary.data);
      }

      const resInsights = await fetch(`${TRANSACTION_API}/insights?userId=${user.id}`);
      if (resInsights.ok) {
        const dataInsights = await resInsights.json();
        setInsights(dataInsights.data);
      }

      setIsSandboxMode(false);
    } catch (err) {
      console.warn('API server offline. Swapping to local sandbox mode.');
      setIsSandboxMode(true);
      runLocalMathAndFilters();
    }
  };

  const runLocalMathAndFilters = () => {
    let filtered = [...INITIAL_MOCK_TRANSACTIONS];
    if (categoryFilter && categoryFilter !== 'All Categories') {
      filtered = filtered.filter(t => t.category.toLowerCase() === categoryFilter.toLowerCase());
    }
    if (startDateFilter) {
      filtered = filtered.filter(t => t.date >= startDateFilter);
    }
    if (endDateFilter) {
      filtered = filtered.filter(t => t.date <= endDateFilter);
    }
    filtered.sort((a, b) => b.date.localeCompare(a.date));
    setTransactions(filtered);

    let inc = 0;
    let exp = 0;
    const sums: Record<string, number> = {};

    INITIAL_MOCK_TRANSACTIONS.forEach(t => {
      if (t.type === 'INCOME') {
        inc += t.amount;
      } else {
        exp += t.amount;
        sums[t.category] = (sums[t.category] || 0) + t.amount;
      }
    });

    let topCat = 'None';
    let maxExp = 0;
    Object.entries(sums).forEach(([cat, amt]) => {
      if (amt > maxExp) {
        maxExp = amt;
        topCat = cat;
      }
    });

    setSummary({
      totalIncome: inc,
      totalExpense: exp,
      netBalance: inc - exp,
      topSpendingCategory: topCat,
      topCategoryAmount: maxExp
    });

    const rate = inc > 0 ? ((inc - exp) / inc) * 100 : 0;
    setInsights([
      {
        title: 'Monthly Savings Rate',
        type: rate >= 30 ? 'success' : 'info',
        description: `Your savings rate is ${rate.toFixed(1)}%. You are saving ₹${(inc - exp).toFixed(0)} of your salary.`
      },
      {
        title: 'Dominant Expense Category',
        type: 'info',
        description: `${topCat} is your leading expense category, consuming ₹${maxExp.toFixed(0)}.`
      },
      {
        title: 'Developer Finance Tip',
        type: 'success',
        description: 'Set hotkeys to record expenses instantly. Autopay credit cards to prevent late interests.'
      }
    ]);
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [categoryFilter, startDateFilter, endDateFilter, user]);

  const handleAddTransaction = async (t: { amount: number; category: string; type: string; date: string; note: string }) => {
    if (!user) return;
    try {
      const res = await fetch(TRANSACTION_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...t, userId: user.id })
      });
      if (res.ok) {
        await fetchData();
      } else {
        throw new Error();
      }
    } catch (err) {
      const newId = Date.now();
      INITIAL_MOCK_TRANSACTIONS.push({
        id: newId,
        ...t
      });
      fetchData();
    }

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#8b5cf6', '#6366f1', '#10b981', '#f59e0b']
    });
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      const res = await fetch(`${TRANSACTION_API}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
      } else {
        throw new Error();
      }
    } catch (err) {
      const index = INITIAL_MOCK_TRANSACTIONS.findIndex(t => t.id === id);
      if (index > -1) {
        INITIAL_MOCK_TRANSACTIONS.splice(index, 1);
      }
      fetchData();
    }
  };

  const handleClearFilters = () => {
    setCategoryFilter('All Categories');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  const savingInsightString = insights.find(i => i.title === 'Monthly Savings Rate')?.description || '';

  if (!user) {
    return (
      <div className="app-wrapper">
        <Navbar user={null} onLogout={() => {}} />

        {isSandboxMode && (
          <div style={{
            backgroundColor: 'var(--color-accent-yellow-soft)',
            color: 'var(--color-accent-yellow)',
            fontSize: '13px',
            fontWeight: 600,
            textAlign: 'center',
            padding: '8px 24px',
            borderBottom: '1px solid var(--color-hairline)'
          }}>
            Sandbox Mode: Spring Boot server offline. Interacting with local client mockups.
          </div>
        )}

        <main style={{ flex: 1 }}>
          <Auth onLoginSuccess={(u) => setUser(u)} isSandboxMode={isSandboxMode} />
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <Navbar user={user} onLogout={handleLogout} />

      {isSandboxMode && (
        <div style={{
          backgroundColor: 'var(--color-accent-yellow-soft)',
          color: 'var(--color-accent-yellow)',
          fontSize: '13px',
          fontWeight: 600,
          textAlign: 'center',
          padding: '8px 24px',
          borderBottom: '1px solid var(--color-hairline)'
        }}>
          Sandbox Mode: Spring Boot server offline. Interacting with local client mockups.
        </div>
      )}

      <CommandPalette 
        onAddTransaction={handleAddTransaction}
        setCategoryFilter={setCategoryFilter}
        onClearFilters={handleClearFilters}
        savingInsight={savingInsightString}
      />

      <main style={{ flex: 1 }}>
        <Dashboard 
          transactions={transactions}
          summary={summary}
          insights={insights}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          startDateFilter={startDateFilter}
          setStartDateFilter={setStartDateFilter}
          endDateFilter={endDateFilter}
          setEndDateFilter={setEndDateFilter}
          onAddTransaction={handleAddTransaction}
          onDeleteTransaction={handleDeleteTransaction}
        />
      </main>

      <Footer />
    </div>
  );
}
