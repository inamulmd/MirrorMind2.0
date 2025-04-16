// SignOutButton.jsx
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // Updated to useNavigate
import { auth } from '../components/firebase';

const SignOutButton = () => {
  const { user } = useContext(AuthContext); // Access user state from AuthContext
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      console.log('User signed out');
      navigate('/signin'); // Redirect to the SignIn page after sign-out
    } catch (error) {
      console.error('Error during sign-out:', error.message);
    }
  };

  if (!user) return null; // Don't show the sign-out button if there's no user logged in

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
    >
      Sign Out
    </button>
  );
};

export default SignOutButton;
