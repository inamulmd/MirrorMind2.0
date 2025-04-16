import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { MirrorProvider } from './context/MirrorContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx'; // ✅ make sure this path is correct

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <MirrorProvider>
          <App />
        </MirrorProvider>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
