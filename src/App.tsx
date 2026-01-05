// src/App.tsx
import React, { useState, useEffect } from 'react'; // useEffectを追加
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MemberView from './components/MemberView';
import { LogEditor } from './components/LogEditor';
import { LoginPage } from './components/LoginPage';
import { useAuth } from './contexts/AuthContext';
import { View, Member, Log, AppState } from './types';
import { MOCK_MEMBERS } from './mockData'; // MOCK_LOGS はもう要らん！
import { getLogsFromFirestore } from './lib/firestore'; // 追加！

const App: React.FC = () => {
  const { user, loading } = useAuth();

  const [state, setState] = useState<AppState>({
    view: 'dashboard',
    selectedMemberId: null,
    editingLogId: null,
  });

  const [members] = useState<Member[]>(MOCK_MEMBERS);
  // 👇【変更】最初は空っぽでスタート！
  const [logs, setLogs] = useState<Log[]>([]);

  // 👇【追加】ログインしたら、Firestoreからデータを取ってくる！
  useEffect(() => {
    const fetchLogs = async () => {
      if (user) {
        console.log("Firestoreからデータを読み込み中...");
        const fetchedLogs = await getLogsFromFirestore();
        setLogs(fetchedLogs);
        console.log("読み込み完了！", fetchedLogs);
      }
    };
    fetchLogs();
  }, [user]); // userが変わるたび（ログイン時）に実行

  // ...ここから下は今までと同じロジック...

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
    // 保存後は、ローカルのリストも更新してあげる（再読み込みしなくていいように）
    setLogs(prev => {
      const exists = prev.some(l => l.id === updatedLog.id);
      if (exists) {
        return prev.map(l => l.id === updatedLog.id ? updatedLog : l);
      }
      return [updatedLog, ...prev];
    });
    // メンバーリストに戻る（ダッシュボードに戻りたければ 'dashboard' にしてね）
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
      <Sidebar currentView={state.view} onNavigate={navigate} />
      
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
      </main>
    </div>
  );
};

export default App;