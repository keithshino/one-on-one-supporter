// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

// 型の定義
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

// 文脈（Context）を作る
const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

// ★ここ重要！外で使うためのフックをエクスポート
export const useAuth = () => useContext(AuthContext);

// ★ここ重要！アプリを囲むための部品をエクスポート
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
