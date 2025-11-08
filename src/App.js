import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import ChartComponent from "./components/ChartComponent";
import { Toaster, toast } from "sonner";
import { auth } from "./firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { Sun, Moon, LogIn, LogOut } from "lucide-react";
import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);

  const provider = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      toast.success("Signed in successfully!");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to sign in");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  return (
    <Router>
      <Toaster position="top-right" richColors />

      <div className={`app ${darkMode ? "dark" : ""}`}>
        {/* Floating Top-Right Buttons */}
       <div className="top-right-buttons">
  <button
    onClick={() => setDarkMode(!darkMode)}
    className="btn-outline"
  >
    {darkMode ? <Sun size={18} /> : <Moon size={18} />}{" "}
    {darkMode ? "Light" : "Dark"}
  </button>

  {user ? (
    <div className="user-block">
      <span className="user-name">{user.displayName}</span>
      <button onClick={handleLogout} className="btn-outline red">
        <LogOut size={18} /> Logout
      </button>
    </div>
      ) : (
        <button onClick={handleLogin} className="btn-primary">
          <LogIn size={18} /> Login
        </button>
      )}
    </div>


        {/* Centered Header */}
        <h1 className="dashboard-title">💰 Expense Tracker</h1>

        {/* Navbar */}
        <nav className="navbar">
          <Link to="/">Dashboard</Link>
          <Link to="/add">Add Expense</Link>
          <Link to="/chart">Chart</Link>
          <Link to="/list">List</Link>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<ExpenseForm />} />
          <Route path="/chart" element={<ChartComponent data={[]} />} />
          <Route path="/list" element={<ExpenseList data={[]} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
