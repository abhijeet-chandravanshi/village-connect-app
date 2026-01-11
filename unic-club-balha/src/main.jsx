import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import './i18n'; // Initialize i18next
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
    <App />
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--toast-bg, #1f1f1f)',
                  color: 'var(--toast-color, #fff)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontFamily: 'var(--font-sans)',
                },
                success: {
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
