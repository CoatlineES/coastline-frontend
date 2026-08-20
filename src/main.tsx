import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './config/msalConfig.ts';

import { AuthProvider } from './contexts/AuthContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <MsalProvider instance={msalInstance}>
        <AuthProvider>
        <App />
      </AuthProvider>
      </MsalProvider>
    </BrowserRouter>
  </StrictMode>,
);
