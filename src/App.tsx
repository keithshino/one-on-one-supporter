import React, { useState } from 'react';
// ↓↓↓ { } を外したよ！ ↓↓↓
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MemberView from './components/MemberView';
import LogEditor from './components/LogEditor';
import { LoginPage } from './components/LoginPage'; // ※これは { } のままでいいかも（下で解説）
import { useAuth } from './contexts/AuthContext';
import { View, Member, Log, AppState } from './types';
import { MOCK_MEMBERS, MOCK_LOGS } from './mockData';

const App: React.FC = () => {
  // 1. まず最初に「今ログインしてる？」を確認する（ここが追加ポイント！）
  const { user, loading } = useAuth();

  // 2. もともとあった状態管理（そのまま）
  const [state, setState] = useState<AppState>({
    view: 'dashboard',
    selectedMemberId: null,
    editingLogId: null,
  });

  const [members] = useState<Member[]>(MOCK_MEMBERS);
  const [logs, setLogs] = useState<Log[]>(MOCK_LOGS);

  // 3. もともとあった便利関数たち（そのまま）
  const navigate = (view: View) => {
    setState(prev => ({ ...prev, view, editingLogId: null, selectedMemberId: null }));
  };

  const handleSelectLog = (log: Log) => {
    setState({
      view: 'editor',
      selectedMemberId: log.memberId,
      editingLogId: log.id,
    });
  };

  const handleCreateLog = (memberId: string) => {
    setState({
      view: 'editor',
      selectedMemberId: memberId,
      editingLogId: null,
    });
  };

  const handleSaveLog = (updatedLog: Log) => {
    setLogs(prev => {
      const exists = prev.some(l => l.id === updatedLog.id);
      if (exists) {
        return prev.map(l => l.id === updatedLog.id ? updatedLog : l);
      }
      return [updatedLog, ...prev];
    });
    setState(prev => ({ ...prev, view: 'members' })); // メンバービューに戻るようにしたよ
  };

  const currentMember = state.selectedMemberId ? members.find(m => m.id === state.selectedMemberId) : null;
  const currentLog = state.editingLogId ? logs.find(l => l.id === state.editingLogId) : null;

  // ---------------------------------------------------------
  // 4. ここで門番のチェック！ (ここが最大の追加ポイント！)
  // ---------------------------------------------------------

  // 準備中（ローディング）なら、待ってもらう
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // ユーザーがいなかったら（ログインしてなかったら）、ログイン画面を返す！
  // これで、下のメイン画面には進めなくなるばい。
  if (!user) {
    return <LoginPage />;
  }

  // ---------------------------------------------------------
  // 5. ログインOKなら、いつものアプリを表示！
  // ---------------------------------------------------------
  return (
    <div className="flex min-h-screen">
      {/* Sidebarにログアウト機能をつけるために、propsはいったんそのままでOK */}
      <Sidebar currentView={state.view} onNavigate={navigate} />
      
      <main className="flex-1 ml-64 p-8 bg-slate-50 overflow-y-auto">
        {state.view === 'dashboard' && (
          <Dashboard 
            logs={logs} 
            members={members} 
            onSelectLog={handleSelectLog} 
          />
        )}

        {/* 'members' ビューがない場合はエラーになるかも？ 元のコードに合わせて修正したよ */}
        {state.view === 'members' && ( // もし元のコードが 'member' ならここ直してね
          <MemberView 
            members={members} 
            logs={logs} 
            onSelectMember={(m) => setState({ ...state, selectedMemberId: m.id })}
            onSelectLog={handleSelectLog}
            onCreateLog={handleCreateLog}
            memberId={state.selectedMemberId} // 追加のpropsが必要かも？
          />
        )}

        {state.view === 'editor' && currentMember && (
          <LogEditor 
            log={currentLog || null} 
            member={currentMember} 
            onSave={handleSaveLog} 
            onCancel={() => navigate('members')} 
          />
        )}
      </main>
    </div>
  );
};

export default App;
