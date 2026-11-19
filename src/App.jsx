import React from "react";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "mymoney-transactions-v1";
const BUDGET_KEY = "mymoney-monthly-budget-v1";

const categories = [
  { name: "Food", icon: "🍜", color: "#d8a477" },
  { name: "Transport", icon: "🚌", color: "#8ba8a0" },
  { name: "Shopping", icon: "🛍️", color: "#c59baf" },
  { name: "Education", icon: "📚", color: "#9c9ac4" },
  { name: "Entertainment", icon: "🎬", color: "#d4b96f" },
  { name: "Health", icon: "💊", color: "#8eae86" },
  { name: "Bills", icon: "🧾", color: "#a4a19a" },
  { name: "Other", icon: "✦", color: "#b2a58d" },
  { name: "Salary", icon: "💼", color: "#7e9b83" },
  { name: "Allowance", icon: "💰", color: "#8aa6a0" },
  { name: "Gift", icon: "🎁", color: "#c49aaf" },
  { name: "Other income", icon: "＋", color: "#a5a17d" }
];

const today = new Date().toISOString().slice(0, 10);
const monthKey = (date) => date.slice(0, 7);
const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount || 0);

function readStored(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [transactions, setTransactions] = useState(() => readStored(STORAGE_KEY, []));
  const [budget, setBudget] = useState(() => readStored(BUDGET_KEY, 10000));
  const [selectedMonth, setSelectedMonth] = useState(monthKey(today));
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "Food",
    date: today,
    note: ""
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(BUDGET_KEY, JSON.stringify(budget));
  }, [budget]);

  const monthTransactions = useMemo(
    () => transactions.filter((item) => monthKey(item.date) === selectedMonth),
    [transactions, selectedMonth]
  );

  const income = monthTransactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const expenses = monthTransactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = income - expenses;
  const remaining = budget - expenses;
  const expensePercent = budget > 0 ? Math.min((expenses / budget) * 100, 100) : 0;

  const categoryTotals = categories
    .filter((category) => !["Salary", "Allowance", "Gift", "Other income"].includes(category.name))
    .map((category) => ({
      ...category,
      total: monthTransactions
        .filter((item) => item.type === "expense" && item.category === category.name)
        .reduce((sum, item) => sum + item.amount, 0)
    }))
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total);

  const visibleTransactions = monthTransactions
    .filter((item) => filter === "All" || item.type === filter.toLowerCase())
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);

  const maxCategoryTotal = Math.max(...categoryTotals.map((item) => item.total), 1);

  function changeMonth(offset) {
    const [year, month] = selectedMonth.split("-").map(Number);
    const next = new Date(year, month - 1 + offset, 1);
    setSelectedMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.title.trim() || !Number.isFinite(amount) || amount <= 0 || !form.date) return;

    const newTransaction = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      title: form.title.trim(),
      amount,
      type: form.type,
      category: form.category,
      date: form.date,
      note: form.note.trim(),
      createdAt: Date.now()
    };

    setTransactions((current) => [newTransaction, ...current]);
    setSelectedMonth(monthKey(form.date));
    setForm({ title: "", amount: "", type: "expense", category: "Food", date: today, note: "" });
    setShowForm(false);
  }

  function deleteTransaction(id) {
    if (window.confirm("Delete this transaction?")) {
      setTransactions((current) => current.filter((item) => item.id !== id));
    }
  }

  function exportCSV() {
    const rows = [
      ["Date", "Title", "Type", "Category", "Amount (INR)", "Note"],
      ...monthTransactions.map((item) => [
        item.date, item.title, item.type, item.category, item.amount, item.note || ""
      ])
    ];
    const csv = rows.map((row) => row.map((cell) =>
      `"${String(cell).replaceAll('"', '""')}"`
    ).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mymoney-${selectedMonth}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const monthLabel = new Date(`${selectedMonth}-01T12:00:00`).toLocaleDateString("en-IN", {
    month: "long", year: "numeric"
  });

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">₹</div>
          <div><strong>MyMoney</strong><span>PERSONAL FINANCE</span></div>
        </div>
        <div className="side-label">WORKSPACE</div>
        <div className="nav-item active"><span>▦</span> Overview</div>
        <div className="nav-item"><span>↗</span> Transactions</div>
        <div className="nav-item"><span>◷</span> Monthly budget</div>
        <div className="sidebar-bottom">
          <div className="tip-icon">✦</div>
          <strong>A little clarity goes a long way.</strong>
          <p>Keep track of where your money goes, one day at a time.</p>
          <span className="version">MYMONEY · VERSION 1.0</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="eyebrow">YOUR FINANCIAL SPACE</div>
            <h1>Good day <span>✳</span></h1>
            <p className="subheading">Here's what's happening with your money.</p>
          </div>
          <button className="primary-button" onClick={() => setShowForm(true)}>
            <span>＋</span> Add transaction
          </button>
        </header>

        <section className="month-row">
          <div>
            <span className="section-kicker">MONTHLY OVERVIEW</span>
            <div className="month-picker">
              <button aria-label="Previous month" onClick={() => changeMonth(-1)}>‹</button>
              <strong>{monthLabel}</strong>
              <button aria-label="Next month" onClick={() => changeMonth(1)}>›</button>
            </div>
          </div>
          <button className="quiet-button" onClick={exportCSV}>↓ Export CSV</button>
        </section>

        <section className="summary-grid">
          <article className="summary-card balance-card">
            <div className="card-top"><span>NET BALANCE</span><span className="card-icon">₹</span></div>
            <div className="big-number">{money(balance)}</div>
            <p>Income minus expenses this month</p>
            <div className="balance-decoration">✳</div>
          </article>
          <article className="summary-card">
            <div className="card-top"><span>TOTAL INCOME</span><span className="round-icon income-icon">↙</span></div>
            <div className="big-number">{money(income)}</div>
            <p className="positive-text">↑ Money coming in</p>
          </article>
          <article className="summary-card">
            <div className="card-top"><span>TOTAL EXPENSES</span><span className="round-icon expense-icon">↗</span></div>
            <div className="big-number">{money(expenses)}</div>
            <p>↓ Money going out</p>
          </article>
        </section>

        <section className="content-grid">
          <article className="panel budget-panel">
            <div className="panel-heading">
              <div><span className="section-kicker">SPENDING PLAN</span><h2>Monthly budget</h2></div>
              <button className="edit-button" onClick={() => {
                const value = window.prompt("Set your monthly expense budget (₹):", String(budget));
                if (value !== null && Number(value) >= 0) setBudget(Number(value));
              }}>Edit budget ↗</button>
            </div>
            <div className="budget-numbers">
              <div><span>You've spent</span><strong>{money(expenses)}</strong></div>
              <div className="align-right"><span>Monthly limit</span><strong>{money(budget)}</strong></div>
            </div>
            <div className="progress-track"><div className={`progress-fill ${expenses > budget ? "over" : ""}`} style={{ width: `${expensePercent}%` }} /></div>
            <div className="budget-foot">
              <span>{budget === 0 ? "Set a budget to track spending." : expenses > budget ? "You've crossed your budget." : `${Math.round((expenses / Math.max(budget, 1)) * 100)}% of your budget used`}</span>
              <strong className={remaining < 0 ? "negative-text" : ""}>{money(remaining)} {remaining >= 0 ? "left" : "over"}</strong>
            </div>
          </article>

          <article className="panel category-panel">
            <div className="panel-heading">
              <div><span className="section-kicker">WHERE IT GOES</span><h2>Spending by category</h2></div>
            </div>
            {categoryTotals.length === 0 ? (
              <div className="empty-small">Your category breakdown will appear here once you add expenses.</div>
            ) : (
              <div className="category-list">
                {categoryTotals.slice(0, 5).map((item) => (
                  <div className="category-row" key={item.name}>
                    <span className="category-emoji">{item.icon}</span>
                    <div className="category-info">
                      <div className="category-label"><span>{item.name}</span><strong>{money(item.total)}</strong></div>
                      <div className="mini-track"><div style={{ width: `${(item.total / maxCategoryTotal) * 100}%`, background: item.color }} /></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>

        <section className="panel transactions-panel">
          <div className="panel-heading transaction-heading">
            <div><span className="section-kicker">YOUR MONEY MOVEMENT</span><h2>Recent transactions</h2></div>
            <div className="filter-tabs">
              {["All", "Expense", "Income"].map((item) => (
                <button key={item} className={filter === item ? "selected" : ""} onClick={() => setFilter(item)}>{item}</button>
              ))}
            </div>
          </div>
          {visibleTransactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-art">₹</div>
              <strong>No transactions yet</strong>
              <p>Add your first income or expense to start seeing your money clearly.</p>
              <button className="outline-button" onClick={() => setShowForm(true)}>＋ Add your first transaction</button>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>TRANSACTION</th><th>CATEGORY</th><th>DATE</th><th className="amount-cell">AMOUNT</th><th></th></tr></thead>
                <tbody>
                  {visibleTransactions.map((item) => {
                    const category = categories.find((cat) => cat.name === item.category);
                    return (
                      <tr key={item.id}>
                        <td><div className="transaction-name"><span className="transaction-icon">{category?.icon || "✦"}</span><div><strong>{item.title}</strong>{item.note && <small>{item.note}</small>}</div></div></td>
                        <td><span className="category-pill">{item.category}</span></td>
                        <td className="date-cell">{new Date(`${item.date}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                        <td className={`amount-cell ${item.type === "income" ? "positive-text" : ""}`}>{item.type === "income" ? "+" : "−"}{money(item.amount)}</td>
                        <td><button className="delete-button" title="Delete transaction" onClick={() => deleteTransaction(item.id)}>×</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="footer-note">Made for a little more financial clarity <span>✳</span> Your data stays in this browser.</footer>
      </main>

      {showForm && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowForm(false);
        }}>
          <div className="modal">
            <div className="modal-header">
              <div><span className="section-kicker">NEW ENTRY</span><h2>Add transaction</h2></div>
              <button className="close-button" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="type-switch">
                <button type="button" className={form.type === "expense" ? "active-expense" : ""} onClick={() => setForm({ ...form, type: "expense", category: "Food" })}>Expense</button>
                <button type="button" className={form.type === "income" ? "active-income" : ""} onClick={() => setForm({ ...form, type: "income", category: "Salary" })}>Income</button>
              </div>
              <label>What was it for?
                <input autoFocus required placeholder="e.g. Lunch, groceries, stipend" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </label>
              <label>Amount (₹)
                <div className="amount-input"><span>₹</span><input required type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
              </label>
              <div className="form-two-col">
                <label>Category
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {categories.filter((cat) => form.type === "expense"
                      ? !["Salary", "Allowance", "Gift", "Other income"].includes(cat.name)
                      : ["Salary", "Allowance", "Gift", "Other income"].includes(cat.name)
                    ).map((cat) => <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>)}
                  </select>
                </label>
                <label>Date
                  <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </label>
              </div>
              <label>Note <span className="optional">(optional)</span>
                <input placeholder="Add a little detail..." value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
              </label>
              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="primary-button">Save transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
