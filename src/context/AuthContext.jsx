import React, { createContext, useState, useEffect } from 'react';
import { auth } from '../components/firebase';

// Create the AuthContext
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state
  const [error, setError] = useState(null); // Added error state to capture auth errors

  // useEffect to listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        setUser(user); // Set user when state changes
        setLoading(false); // Stop loading once auth state is determined
      },
      (error) => {
        setError(error.message); // Set any auth errors
        setLoading(false); // Stop loading if there's an error
      }
    );

    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
