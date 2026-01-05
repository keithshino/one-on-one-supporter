// src/components/LoginPage.tsx
import React, { useState } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { LogIn, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setError('');
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // ドメインチェック（@tokium.jp 以外は弾く！）
      if (!user.email?.endsWith('@tokium.jp')) {
        await signOut(auth);
        setError('社用メールアドレス (@tokium.jp) でログインしてください。');
        return;
      }
      
    } catch (err) {
      console.error(err);
      setError('ログインに失敗しました。もう一度お試しください。');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">One On One Supporter</h1>
        <p className="text-gray-500 mb-8">社内アカウントでログインしてください</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors font-medium"
        >
          <LogIn size={20} />
          Googleでログイン
        </button>
      </div>
    </div>
  );
};