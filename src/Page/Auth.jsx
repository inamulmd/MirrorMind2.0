// src/pages/Auth.jsx
import React, { useState } from 'react';
import { auth, provider } from '../components/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';

// 🔻 Firestore imports –––––––––––––––––––––––––––––––––––
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../components/firebase';
// 🔺 Firestore imports –––––––––––––––––––––––––––––––––––

import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async () => {
    setLoading(true);
    try {
      let result;
      if (isRegister) {
        result = await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Registered successfully!');

        // 🔻 Store new user in Firestore –––––––––––––––––––––––––––––––––––
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          createdAt: new Date(),
        });
        // 🔺 Firestore registration block –––––––––––––––––––––––––––––––––––
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
        toast.success('Logged in successfully!');

        // 🔻 Ensure user exists in Firestore –––––––––––––––––––––––––––––––
        const userRef = doc(db, 'users', result.user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: result.user.uid,
            email: result.user.email,
            createdAt: new Date(),
          });
        }
        // 🔺 Firestore login fallback –––––––––––––––––––––––––––––––––––––––
      }

      console.log(result.user);
      navigate('/home');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      toast.success('Signed in with Google!');

      // 🔻 Store Google user in Firestore if new ––––––––––––––––––––––––––
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          createdAt: new Date(),
        });
      }
      // 🔺 Google sign-in Firestore logic ––––––––––––––––––––––––––––––––––

      console.log(result.user);
      console.log('✅ Google sign-in successful, navigating to /home...');
      navigate('/home');
      console.log('✅ Navigation triggered');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6">
      <h2 className="text-2xl font-bold">
        {isRegister ? 'Register' : 'Login'}
      </h2>
      <input
        type="email"
        placeholder="Email"
        className="px-4 py-2 border rounded-md w-72"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="px-4 py-2 border rounded-md w-72"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleAuth}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-72"
        disabled={loading}
      >
        {loading ? 'Processing...' : isRegister ? 'Register' : 'Login'}
      </button>

      <button
        onClick={handleGoogleSignIn}
        className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 w-72"
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </button>

      <p>
        {isRegister ? 'Already have an account?' : 'New user?'}{' '}
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="text-blue-600 hover:underline"
        >
          {isRegister ? 'Login' : 'Register'}
        </button>
      </p>
    </div>
  );
};

export default Auth;
