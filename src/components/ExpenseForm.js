import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'sonner';
import '../cssfiles/ExpenseForm.css';

const ExpenseForm = ({ onExpenseAdded }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !amount || parseFloat(amount) <= 0) {
      toast.error('Please fill all fields correctly');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'expenses'), {
        title: title.trim(),
        amount: parseFloat(amount),
        type,
        date,
        createdAt: Date.now(),
      });

      toast.success(`${type === 'income' ? 'Income' : 'Expense'} added successfully!`);
      setTitle('');
      setAmount('');
      setType('expense');
      setDate(new Date().toISOString().split('T')[0]);
      onExpenseAdded();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="expense-card">
      <h2 className="expense-title">Add New Entry</h2>
      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Salary, Groceries, Rent"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount (₹)</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="form-group">
          <label>Type</label>
          <div className="type-buttons">
            <button
              type="button"
              onClick={() => setType('income')}
              className={type === 'income' ? 'type-btn income active' : 'type-btn income'}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={type === 'expense' ? 'type-btn expense active' : 'type-btn expense'}
            >
              Expense
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Adding...' : 'Add Entry'}
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;
