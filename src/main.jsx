import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// import App from './App.jsx';
import './index.css';

import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';

const id = import.meta.env.VITE_GOOGLE_CLINT_ID;


const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <StrictMode>
    <GoogleOAuthProvider clientId={id}>
      <App/>
    </GoogleOAuthProvider>
  </StrictMode>
);
