import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import '../cssfiles/ChartComponent.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const ChartComponent = ({ refreshTrigger }) => {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'expenses'), (snapshot) => {
      let income = 0;
      let expense = 0;
      const expenses = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        expenses.push({ id: doc.id, ...data });

        if (data.type === 'income') {
          income += data.amount;
        } else {
          expense += data.amount;
        }
      });

      setTotalIncome(income);
      setTotalExpense(expense);

      // Monthly grouping
      const monthlyMap = new Map();
      expenses.forEach((exp) => {
        const month = new Date(exp.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        const current = monthlyMap.get(month) || { income: 0, expense: 0 };
        if (exp.type === 'income') {
          current.income += exp.amount;
        } else {
          current.expense += exp.amount;
        }
        monthlyMap.set(month, current);
      });

      const sortedMonthly = Array.from(monthlyMap.entries())
        .map(([month, data]) => ({ month, ...data }))
        .slice(-6);

      setMonthlyData(sortedMonthly);
    });

    return () => unsubscribe();
  }, [refreshTrigger]);

  const doughnutData = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        data: [totalIncome, totalExpense],
        backgroundColor: ['#16a34a', '#e11d48'],
        borderColor: ['#16a34a', '#e11d48'],
        borderWidth: 2,
      },
    ],
  };

  const barData = {
    labels: monthlyData.map((d) => d.month),
    datasets: [
      {
        label: 'Income',
        data: monthlyData.map((d) => d.income),
        backgroundColor: '#16a34a',
        borderRadius: 6,
      },
      {
        label: 'Expenses',
        data: monthlyData.map((d) => d.expense),
        backgroundColor: '#e11d48',
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 13, family: 'Inter, system-ui, sans-serif' },
        },
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => '₹' + value,
        },
      },
    },
  };

  return (
    <div className="chart-grid">
      <div className="chart-card">
        <h3 className="chart-title">Income vs Expenses</h3>
        <div className="chart-container">
          <Doughnut data={doughnutData} options={chartOptions} />
        </div>
        <div className="chart-summary">
          <div className="summary-row">
            <span>Total Income:</span>
            <span className="income-text">₹{totalIncome.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Total Expenses:</span>
            <span className="expense-text">₹{totalExpense.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Balance:</span>
            <span
              className={`balance-text ${
                totalIncome - totalExpense >= 0 ? 'income-text' : 'expense-text'
              }`}
            >
              ₹{(totalIncome - totalExpense).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="chart-card">
        <h3 className="chart-title">Monthly Overview</h3>
        <div className="chart-container">
          {monthlyData.length > 0 ? (
            <Bar data={barData} options={barOptions} />
          ) : (
            <div className="chart-empty">No data available yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartComponent;
