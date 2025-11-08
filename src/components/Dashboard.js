import React, { useState } from 'react';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import ChartComponent from './ChartComponent';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
import '../cssfiles/Dashboard.css';

const Dashboard = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const handleExpenseAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const exportToCSV = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'expenses'));
      const expenses = [];
      snapshot.forEach((doc) => expenses.push({ id: doc.id, ...doc.data() }));

      if (expenses.length === 0) {
        toast.error('No data to export');
        return;
      }

      const headers = ['Title', 'Amount', 'Type', 'Date'];
      const rows = expenses.map((exp) => [
        exp.title,
        exp.amount.toFixed(2),
        exp.type,
        new Date(exp.date).toLocaleDateString(),
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();

      toast.success('CSV exported successfully!');
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('Failed to export CSV');
    }
  };

  const exportToPDF = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'expenses'));
      const expenses = [];
      let totalIncome = 0;
      let totalExpense = 0;

      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        expenses.push(data);
        if (data.type === 'income') totalIncome += data.amount;
        else totalExpense += data.amount;
      });

      if (expenses.length === 0) {
        toast.error('No data to export');
        return;
      }

      const docPDF = new jsPDF();

      docPDF.setFontSize(20);
      docPDF.setTextColor(74, 144, 226);
      docPDF.text('Expense Tracker Report', 14, 20);

      docPDF.setFontSize(10);
      docPDF.setTextColor(100, 100, 100);
      docPDF.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 27);

      docPDF.setFontSize(12);
      docPDF.setTextColor(0, 0, 0);
      docPDF.text(`Total Income: ₹${totalIncome.toFixed(2)}`, 14, 40);
      docPDF.text(`Total Expenses: ₹${totalExpense.toFixed(2)}`, 14, 47);
      docPDF.text(`Balance: ₹${(totalIncome - totalExpense).toFixed(2)}`, 14, 54);

      const tableData = expenses.map((exp) => [
        exp.title,
        `₹${exp.amount.toFixed(2)}`,
        exp.type,
        new Date(exp.date).toLocaleDateString(),
      ]);

      autoTable(docPDF, {
        head: [['Title', 'Amount', 'Type', 'Date']],
        body: tableData,
        startY: 65,
        theme: 'grid',
        headStyles: {
          fillColor: [74, 144, 226],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 10,
          cellPadding: 4,
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
      });

      docPDF.save(`expense_report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF');
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="wallet-icon">💰</div>
          <h1>Expense Tracker</h1>
        </div>
        <div className="header-buttons">
          <button onClick={exportToCSV} className="btn-outline">
            📄 Export CSV
          </button>
          <button onClick={exportToPDF} className="btn-primary">
            ⬇️ Export PDF
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-grid">
          <div className="form-section">
            <ExpenseForm onExpenseAdded={handleExpenseAdded} />
          </div>
          <div className="list-section">
            <ExpenseList refreshTrigger={refreshTrigger} />
          </div>
        </div>

        <ChartComponent refreshTrigger={refreshTrigger} />
      </main>
    </div>
  );
};

export default Dashboard;
