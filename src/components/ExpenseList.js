import React, { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'sonner';
import '../cssfiles/ExpenseList.css';

const ExpenseList = ({ refreshTrigger }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'expenses'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const expenseData = [];
        snapshot.forEach((doc) => {
          expenseData.push({ id: doc.id, ...doc.data() });
        });
        setExpenses(expenseData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching expenses:', error);
        toast.error('Failed to load expenses');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [refreshTrigger]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'expenses', id));
      toast.success('Entry deleted successfully');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete entry');
    }
  };

  if (loading) {
    return (
      <div className="expense-card">
        <h2 className="expense-title">Recent Transactions</h2>
        <p className="expense-loading">Loading...</p>
      </div>
    );
  }

  return (
    <div className="expense-card">
      <h2 className="expense-title">Recent Transactions</h2>

      {expenses.length === 0 ? (
        <p className="expense-empty">No transactions yet. Add your first entry above!</p>
      ) : (
        <div className="expense-list">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className={`expense-item ${expense.type === 'income' ? 'income' : 'expense'}`}
            >
              <div className="expense-info">
                <div className="expense-icon">
                  {expense.type === 'income' ? '⬆️' : '⬇️'}
                </div>
                <div className="expense-details">
                  <h3>{expense.title}</h3>
                  <p>
                    {new Date(expense.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="expense-actions">
                <span className={`amount ${expense.type}`}>
                  {expense.type === 'income' ? '+' : '-'}₹{expense.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="delete-btn"
                  title="Delete Entry"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
