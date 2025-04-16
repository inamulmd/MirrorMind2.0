import React from 'react'
import { auth, provider } from '../firebase'; 
import { GoogleAuthProvider } from 'firebase/auth/web-extension';

const signInWIthGoogle = () => {
    
    const sign = () => {
        const provider = new GoogleAuthProvider();
        auth.signInWithPopup(provider)
          .then((result) => {
            console.log(result.user);
            if(result.user){
                toast.success("user logged in Successfully",{
                    position:" top-center",
                });
                window.location.href ="/profile"
            }
          })
          .catch((error) => {
            console.error(error.message);
          });
      };
    
      return (
        <div className="flex justify-center items-center h-screen">
          <button
            onClick={sign}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Sign in with Google
          </button>
        </div>
      );
}

export default signInWIthGoogle