import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { auth } from './components/firebase';
import Home from './components/Home';
import Journal from './components/Journal';
import Timeline from './components/Timeline';
import Avtar from './components/Avtar';
import Navbar from './components/Navbar';
import Auth from './Page/Auth';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false); // Set loading to false once the auth state is checked
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-white text-xl">
        Checking auth status...
      </div>
    );
  }

  return (
    <AuthProvider>
      <Routes>
        {/* 🔐 Public Routes */}
        <Route path="/auth" element={<Auth />} />

        {/* 🔒 Protected Routes */}
        <Route path="/home" element={user ? <Home /> : <Navigate to="/auth" />} />
        <Route path="/journal" element={user ? <Journal /> : <Navigate to="/auth" />} />
        <Route path="/timeline" element={user ? <Timeline /> : <Navigate to="/auth" />} />
        <Route path="/avtar" element={user ? <Avtar /> : <Navigate to="/auth" />} />
        <Route path="/navbar" element={user ? <Navbar /> : <Navigate to="/auth" />} />

        {/* 🚧 Fallback */}
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
      <ToastContainer />
    </AuthProvider>
  );
};

export default App;
