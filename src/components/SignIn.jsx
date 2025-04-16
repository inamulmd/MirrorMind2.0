// SignIn.jsx
import React, { useState } from 'react';
import { auth, provider, signInWithPopup } from '../components/firebase';

const SignIn = () => {
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider); // Use the updated method
      const user = result.user;
      console.log('Signed in as:', user);
    } catch (error) {
      console.error('Error during sign-in:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <button
        onClick={signInWithGoogle}
        className={`px-6 py-3 ${loading ? 'bg-gray-400' : 'bg-blue-600'} text-white rounded-md`}
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </button>
    </div>
  );
};

export default SignIn;
