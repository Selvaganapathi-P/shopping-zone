import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import Navbar from "../components/Navbar/Navbar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie,
  Cell, Legend, LineChart, Line
} from "recharts";
import {
  FiShoppingBag, FiTrendingUp, FiCalendar, FiList
} from "react-icons/fi";
import "./ExpenseTracker.css";

const COLORS = [
  "#e85d04","#f4a261","#2ecc71",
  "#3498db","#9b59b6","#e74c3c"
];

const months = [
  "January","February","March","April",
  "May","June","July","August",
  "September","October","November","December"
];

export default function ExpenseTracker() {
  useAuth();

  const [expenses, setExpenses]         = useState([]);
  const [orders, setOrders]             = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString("default", { month: "long" })
  );
  const [selectedYear, setSelectedYear]   = useState(
    new Date().getFullYear()
  );
  const [selectedDate, setSelectedDate]   = useState(null);

  // Fetch expenses and orders
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch expenses for selected month + year
        const expRes = await API.get(
          `/expenses?month=${selectedMonth}&year=${selectedYear}`
        );
        setExpenses(expRes.data);

        // Fetch my orders and filter
        const ordRes = await API.get("/orders/my");
        const filtered = ordRes.data.filter(
          (o) =>
            o.month === selectedMonth &&
            o.year  === Number(selectedYear)
        );
        setOrders(filtered);
      } catch (err) {
        console.error("Expense fetch error:", err);
      }
      setLoading(false);
    };
    fetchData();
  }, [selectedMonth, selectedYear]);

  // Fetch monthly trend
  useEffect(() => {
    const fetchTrend = async () => {
      try {
        const { data } = await API.get(
          `/expenses?year=${selectedYear}`
        );
        const trend = months.map((m) => ({
          month:  m.slice(0, 3),
          amount: data
            .filter((e) => e.month === m)
            .reduce((sum, e) => sum + e.amount, 0),
        }));
        setMonthlyTrend(trend);
      } catch (err) {
        console.error("Trend fetch error:", err);
      }
    };
    fetchTrend();
  }, [selectedYear, expenses]);

  // Calculations
  const totalSpent    = expenses.reduce((s, e) => s + e.amount, 0);
  const totalOrders   = orders.length;
  const avgOrderValue = totalOrders > 0
    ? Math.round(totalSpent / totalOrders) : 0;

  // Filter by date
  const displayExpenses = selectedDate
    ? expenses.filter((e) => {
        const d = new Date(e.createdAt).getDate();
        return d === selectedDate;
      })
    : expenses;

  const dateTotal = displayExpenses.reduce((s, e) => s + e.amount, 0);

  // Category data for Pie
  const categoryData = expenses.reduce((acc, e) => {
    const existing = acc.find((a) => a.name === e.category);
    if (existing) existing.value += e.amount;
    else acc.push({ name: e.category, value: e.amount });
    return acc;
  }, []);

  // Daily data for Bar
  const dailyData = expenses.reduce((acc, e) => {
    const date = new Date(e.createdAt).getDate();
    const day  = `Day ${date}`;
    const existing = acc.find((a) => a.day === day);
    if (existing) existing.amount += e.amount;
    else acc.push({ day, amount: e.amount });
    return acc;
  }, []).sort((a, b) =>
    parseInt(a.day.split(" ")[1]) - parseInt(b.day.split(" ")[1])
  );

  return (
    <div className="expense-page">
      <Navbar />

      <div className="expense-container">

        {/* Header */}
        <div className="expense-header">
          <div>
            <h1>📊 Expense Tracker</h1>
            <p>Monitor your monthly spending at a glance</p>
          </div>

          {/* Filters */}
          <div className="month-year-selector">
            <FiCalendar size={16} className="cal-icon" />

            <div className="selector-group">
              <label>Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setSelectedDate(null);
                }}
              >
                {months.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="selector-divider" />

            <div className="selector-group">
              <label>Year</label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(Number(e.target.value));
                  setSelectedDate(null);
                }}
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="selector-divider" />

            <div className="selector-group">
              <label>Date</label>
              <select
                value={selectedDate || ""}
                onChange={(e) =>
                  setSelectedDate(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
              >
                <option value="">All Dates</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d} {selectedMonth.slice(0, 3)}
                  </option>
                ))}
              </select>
            </div>

            {selectedDate && (
              <button
                className="clear-date-btn"
                onClick={() => setSelectedDate(null)}
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="exp-loading">Loading your expenses...</div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="summary-cards">
              <div className="summary-card orange">
                <div className="summary-icon">
                  <FiShoppingBag size={24} />
                </div>
                <div>
                  <p>
                    {selectedDate
                      ? `${selectedDate} ${selectedMonth.slice(0, 3)} Spent`
                      : "Total Spent"}
                  </p>
                  <h2>
                    ₹{(selectedDate ? dateTotal : totalSpent).toLocaleString()}
                  </h2>
                </div>
              </div>

              <div className="summary-card blue">
                <div className="summary-icon">
                  <FiList size={24} />
                </div>
                <div>
                  <p>{selectedDate ? "Day Transactions" : "Total Orders"}</p>
                  <h2>
                    {selectedDate ? displayExpenses.length : totalOrders}
                  </h2>
                </div>
              </div>

              <div className="summary-card green">
                <div className="summary-icon">
                  <FiTrendingUp size={24} />
                </div>
                <div>
                  <p>Avg Order Value</p>
                  <h2>₹{avgOrderValue.toLocaleString()}</h2>
                </div>
              </div>

              <div className="summary-card purple">
                <div className="summary-icon">
                  <FiCalendar size={24} />
                </div>
                <div>
                  <p>Viewing</p>
                  <h2>
                    {selectedDate
                      ? `${selectedDate} ${selectedMonth.slice(0, 3)}`
                      : `${selectedMonth.slice(0, 3)} ${selectedYear}`}
                  </h2>
                </div>
              </div>
            </div>

            {expenses.length === 0 ? (
              <div className="no-expense">
                <span>🧾</span>
                <h3>No expenses for {selectedMonth}</h3>
                <p>Place an order to start tracking your expenses.</p>
              </div>
            ) : (
              <>
                {/* Bar + Pie Charts */}
                <div className="charts-row">
                  <div className="chart-card wide">
                    <h3>Daily Spending — {selectedMonth}</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={dailyData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#f0f0f0"
                        />
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(val) => [`₹${val}`, "Spent"]}
                          contentStyle={{ borderRadius: "8px" }}
                        />
                        <Bar
                          dataKey="amount"
                          fill="#e85d04"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="chart-card">
                    <h3>Category Breakdown</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {categoryData.map((_, index) => (
                            <Cell
                              key={index}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val) => `₹${val}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Line Chart */}
                <div className="chart-card full">
                  <h3>Monthly Spending Trend — {selectedYear}</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={monthlyTrend}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f0f0f0"
                      />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(val) => [`₹${val}`, "Spent"]}
                        contentStyle={{ borderRadius: "8px" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#e85d04"
                        strokeWidth={3}
                        dot={{ fill: "#e85d04", r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Transaction History */}
                <div className="expense-list-card">
                  <h3>
                    Transaction History —{" "}
                    {selectedDate
                      ? `${selectedDate} ${selectedMonth} ${selectedYear}`
                      : `${selectedMonth} ${selectedYear}`}
                  </h3>
                  <div className="expense-list">
                    {displayExpenses.length === 0 ? (
                      <p className="no-date-exp">
                        No transactions on this date.
                      </p>
                    ) : (
                      displayExpenses.map((exp) => (
                        <div className="expense-row" key={exp._id}>
                          <div className="expense-row-left">
                            <div className="exp-dot" />
                            <div>
                              <p className="exp-name">{exp.name}</p>
                              <span className="exp-cat">{exp.category}</span>
                            </div>
                          </div>
                          <p className="exp-amount">
                            ₹{exp.amount.toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Day-wise Breakdown */}
                <div className="expense-list-card">
                  <h3>
                    📅 Day-wise Breakdown — {selectedMonth} {selectedYear}
                  </h3>
                  <div className="daywise-list">
                    {dailyData.map((day, i) => {
                      const dayNumber = parseInt(day.day.split(" ")[1]);
                      const dayExpenses = displayExpenses.filter(
                        (e) => new Date(e.createdAt).getDate() === dayNumber
                      );
                      if (dayExpenses.length === 0) return null;

                      return (
                        <div className="day-group" key={i}>
                          <div className="day-header">
                            <div className="day-badge">
                              <span className="day-num">{dayNumber}</span>
                              <span className="day-month">
                                {selectedMonth.slice(0, 3)}
                              </span>
                            </div>
                            <div className="day-header-info">
                              <p className="day-label">{day.day}</p>
                              <span className="day-item-count">
                                {dayExpenses.length} transaction
                                {dayExpenses.length > 1 ? "s" : ""}
                              </span>
                            </div>
                            <div className="day-total-amount">
                              ₹{day.amount.toLocaleString()}
                            </div>
                          </div>

                          <div className="day-items">
                            {dayExpenses.map((exp) => (
                              <div className="day-item-row" key={exp._id}>
                                <div className="day-item-left">
                                  <span
                                    className="day-item-dot"
                                    style={{
                                      background:
                                        COLORS[
                                          categoryData.findIndex(
                                            (c) => c.name === exp.category
                                          ) % COLORS.length
                                        ],
                                    }}
                                  />
                                  <div>
                                    <p className="day-item-name">
                                      {exp.name}
                                    </p>
                                    <span className="day-item-cat">
                                      {exp.category}
                                    </span>
                                  </div>
                                </div>
                                <span className="day-item-amount">
                                  ₹{exp.amount.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}