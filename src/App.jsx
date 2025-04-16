// App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Correct import for Routes
import { AuthProvider } from './context/AuthContext';
import { auth } from './components/firebase';
import SignIn from './components/SignIn';
import Home from './components/Home';
import Journal from './components/Journal';
import Timeline from './components/Timeline';
import Avtar from './components/Avtar';
import PrivateRoute from './components/PrivateRoute';
import { Navigate } from 'react-router-dom'; // Import Navigate

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthProvider>
      <Routes>
        <Route path="/signin" element={user ? <Navigate to="/home" /> : <SignIn />} />

        <Route path="/home" element={<PrivateRoute element={Home} />} />
        <Route path="/journal" element={<PrivateRoute element={Journal} />} />
        <Route path="/timeline" element={<PrivateRoute element={Timeline} />} />
        <Route path="/avtar" element={<PrivateRoute element={Avtar} />} />

        <Route path="/" element={<Navigate to="/signin" />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
