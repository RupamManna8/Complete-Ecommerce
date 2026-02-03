import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// import App from './App.jsx';
import './index.css';

import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';

const id = "76040923483-512i2pt2qokupqfvvheq1j2ec4unpj5q.apps.googleusercontent.com"

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <StrictMode>
    <GoogleOAuthProvider clientId={id}>
      <App/>
    </GoogleOAuthProvider>
  </StrictMode>
);
