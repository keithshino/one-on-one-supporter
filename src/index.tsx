// src/index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
// index.cssの読み込み行があれば削除
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <AuthProvider> {/* ここでアプリ全体を包む！ */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);
