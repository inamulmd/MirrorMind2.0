import React from 'react';
import { Navigate } from 'react-router-dom'; // Correct import
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ element: Component, ...rest }) => {
    console.log("In PrivateRoute");
  const { user } = useContext(AuthContext);

  return user ? <Component {...rest} /> : <Navigate to="/signin" />;
  console.log(" outside In PrivateRoute");
};

export default PrivateRoute;
