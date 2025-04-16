import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // Update to useNavigate
import { auth } from '../components/firebase';

import SignOutButton from './SignOutButton'; // Import the SignOutButton component

const Home = () => {
  const { user } = useContext(AuthContext); // Accessing user state from AuthContext
  const navigate = useNavigate(); // Update to useNavigate

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      console.log('User signed out');
      navigate('/signin'); // Redirect user to sign-in page after signing out
    } catch (error) {
      console.error('Error during sign-out:', error.message);
    }
  };

  return (
    <div className="homebar w-full h-full">
      <section className="py-12">
        <h1 className="text-amber-50 text-center justify-center items-center text-6xl mb-4">
          Welcome to MirrorMind
        </h1>
        <p className="text-lg text-amber-50">Start your journey with your AI twin!</p>
      </section>

      <section>
        {user ? (
          <>
            <h2>Not a chatbot. It’s you — evolved.</h2>
            <p>Feed it your thoughts, moods, voice. Watch it grow with you.</p>
            <button
              onClick={() => navigate('/journal')} // Navigate to Journal page using navigate
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Start Journaling
            </button>
            <button
              onClick={handleSignOut}
              className="mt-4 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Sign Out
            </button>
          </>
        ) : (
          <div>
            <h2>Please sign in to begin your journey</h2>
            <button
              onClick={() => navigate('/signin')} // Navigate to Sign In page using navigate
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Sign In
            </button>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="mt-8">
        <h3 className="text-2xl font-semibold">What MirrorMind Can Do</h3>
        <ul className="list-disc pl-6 mt-4">
          <li>Talk with your AI Twin</li>
          <li>Ask what “you” would do</li>
          <li>See how you change over time</li>
        </ul>
      </section>
    </div>
  );
};

export default Home;
