import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { auth } from '../components/firebase';
import Navbar from '../components/Navbar';

const Home = () => {
  const { user, loading } = useContext(AuthContext); // UPDATED
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      console.log('User signed out');
      navigate('/signin');
    } catch (error) {
      console.error('Error during sign-out:', error.message);
    }
  };

  // 🔻 Show loading state until Firebase confirms user
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-white text-xl">
        Checking auth status...
      </div>
    );
  }

  return (
    <div className="homebar w-full h-full">
      <Navbar />
      <section className="py-12">
        <h1 className="text-amber-50 text-center text-6xl mb-4">
          Welcome to MirrorMind
        </h1>
        <p className="text-lg text-amber-50 text-center">Start your journey with your AI twin!</p>
      </section>

      <section className="text-white text-center mt-6">
        {user ? (
          <>
            <h2 className="text-2xl mb-2">Not a chatbot. It’s you — evolved.</h2>
            <p className="mb-4">Feed it your thoughts, moods, voice. Watch it grow with you.</p>
            <button
              onClick={() => navigate('/journal')}
              className="mt-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
              onClick={() => navigate('/signin')}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Sign In
            </button>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="mt-8 text-white text-center">
        <h3 className="text-2xl font-semibold">What MirrorMind Can Do</h3>
        <ul className="list-disc pl-6 mt-4 text-left inline-block">
          <li>Talk with your AI Twin</li>
          <li>Ask what “you” would do</li>
          <li>See how you change over time</li>
        </ul>
      </section>
    </div>
  );
};

export default Home;
