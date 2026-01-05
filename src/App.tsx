// src/App.tsx
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MemberView from './components/MemberView';
import { LogEditor } from './components/LogEditor';
import { LoginPage } from './components/LoginPage';
import { useAuth } from './contexts/AuthContext';
import { View, Member, Log, AppState } from './types';
import MyHistory from './components/MyHistory';
import MyProfile from './components/MyProfile'; // 👈 追加
import { getMembersFromFirestore, getLogsFromFirestore } from './lib/firestore'; 

const App: React.FC = () => {
  const { user, loading } = useAuth();

  const [state, setState] = useState<AppState>({
    view: 'dashboard',
    selectedMemberId: null,
    editingLogId: null,
  });

  // 👇 【変更】最初は空っぽでスタートして、DBから読み込む！
  const [members, setMembers] = useState<Member[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);

  // 👇 【変更】メンバーとログ、両方を読み込むように進化！
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        console.log("Firestoreからデータを読み込み中...");
        
        // 並行して両方のデータを取ってくる（待ち時間が減るテクニック！）
        const [fetchedMembers, fetchedLogs] = await Promise.all([
          getMembersFromFirestore(),
          getLogsFromFirestore()
        ]);

        setMembers(fetchedMembers);
        setLogs(fetchedLogs);
        console.log("読み込み完了！", { members: fetchedMembers, logs: fetchedLogs });
      }
    };
    fetchData();
  }, [user]);

  // ... (ここから下のロジックは今までと同じでOK！) ...
  // 👇 現在のユーザーが管理者かどうか判定
  const currentUser = members.find(m => m.email === user?.email);
  const isAdmin = currentUser?.isAdmin === true;

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
    setState(prev => ({ ...prev, view: 'dashboard' })); 
  };

  const currentMember = state.selectedMemberId ? members.find(m => m.id === state.selectedMemberId) : null;
  const currentLog = state.editingLogId ? logs.find(l => l.id === state.editingLogId) : null;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar currentView={state.view} onNavigate={navigate} isAdmin={isAdmin} />
      
      <main className="flex-1 ml-64 p-8 bg-slate-50 overflow-y-auto">
        {state.view === 'dashboard' && (
          <Dashboard 
            logs={logs} 
            members={members} 
            onSelectLog={handleSelectLog} 
          />
        )}

        {state.view === 'members' && (
          <MemberView 
            members={members} 
            logs={logs} 
            onSelectMember={(m) => setState({ ...state, selectedMemberId: m.id })}
            onSelectLog={handleSelectLog}
            onCreateLog={handleCreateLog}
            memberId={state.selectedMemberId}
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

        {state.view === 'my-history' && (
          <MyHistory members={members} logs={logs} />
        )}

        {/* 👇 これを追加！ */}
        {state.view === 'profile' && (
          <MyProfile members={members} />
        )}
        
      </main>
    </div>
  );
};

export default App;