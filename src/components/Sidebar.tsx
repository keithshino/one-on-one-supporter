// src/components/Sidebar.tsx
import React from 'react';
import { View } from '../types';
import { useAuth } from '../contexts/AuthContext'; // 👈 authのインポートは不要なので削除
import { LayoutDashboard, Users, LogOut, MessageSquare, History } from 'lucide-react';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  isAdmin: boolean;
  isManager: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isAdmin, isManager }) => {
  // 👇 【重要】user もここで受け取る！（じゃないと下でエラーになる）
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("ログアウト失敗:", error);
      alert("ログアウトできんかった...");
    }
  };

  // 👇 メニューを表示する条件：管理者 または マネージャー
  const canManage = isAdmin || isManager;

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl z-50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-blue-600 p-2 rounded-lg">
            <MessageSquare size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">1on1 Supporter</h1>
        </div>

        <nav className="space-y-2">
          {/* 👇 条件修正: 管理者 または マネージャー なら表示！ */}
          {canManage && (
            <>
              <button
                onClick={() => onNavigate('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  currentView === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <LayoutDashboard size={20} />
                <span className="font-medium">ダッシュボード</span>
              </button>

              <button
                onClick={() => onNavigate('members')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  currentView === 'members'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Users size={20} />
                <span className="font-medium">メンバーリスト</span>
              </button>
            </>
          )}

          {/* 👇 全員表示（My 1on1） */}
          <button
            onClick={() => onNavigate('my-history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentView === 'my-history'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <History size={20} />
            <span className="font-medium">My 1on1</span>
          </button>
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-800">
        {/* プロフィールボタン */}
        <button 
          onClick={() => onNavigate('profile')}
          className={`w-full flex items-center gap-3 mb-4 px-2 py-2 rounded-lg transition-all text-left group ${
            currentView === 'profile' ? 'bg-slate-800 ring-1 ring-slate-700' : 'hover:bg-slate-800'
          }`}
        >
          {/* 👇 useAuthから取った user を使う */}
          <img 
            src={user?.photoURL || "https://ui-avatars.com/api/?name=User&background=random"} 
            alt="Profile" 
            className="w-10 h-10 rounded-full border-2 border-slate-700 group-hover:border-blue-500 transition-colors" 
          />
          <div className="overflow-hidden">
            <p className="font-bold text-sm truncate text-white group-hover:text-blue-400 transition-colors">
              {user?.displayName || "ゲスト"}
            </p>
            <p className="text-xs text-slate-500 truncate">プロフィール編集 &gt;</p>
          </div>
        </button>
        
        {/* ログアウトボタン */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-slate-400 hover:text-red-400 px-2 py-2 transition-colors text-sm font-medium"
        >
          <LogOut size={18} />
          ログアウト
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
