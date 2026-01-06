// src/App.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';

// コンポーネントのインポート
import { LoginPage } from './components/LoginPage';
import { MemberView } from './components/MemberView';
import { LogEditor } from './components/LogEditor';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MyHistory from './components/MyHistory';
import MyProfile from './components/MyProfile';

// 型とFirebase関連
import { Member, Log, View } from './types';
import { db } from './lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { MemberDetail } from './components/MemberDetail';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  
  // 画面遷移やデータ保持用のState
  const [state, setState] = useState<{ view: View }>({ view: 'dashboard' });
  const [members, setMembers] = useState<Member[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  // 👇 管理者用の表示切り替えスイッチ ('all'=全体, 'team'=自チーム)
  const [adminViewScope, setAdminViewScope] = useState<'all' | 'team'>('all');

  // データ取得 (useEffect)
  useEffect(() => {
    if (!user) return;

    const unsubscribeMembers = onSnapshot(collection(db, "members"), (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member));
      setMembers(membersData);
    });

    const logsQuery = query(collection(db, "logs"), orderBy("date", "desc"));
    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Log));
      setLogs(logsData);
    });

    return () => {
      unsubscribeMembers();
      unsubscribeLogs();
    };
  }, [user]);

  // 権限チェックロジック
  const currentUser = members.find(m => m.email === user?.email);
  const isAdmin = currentUser?.isAdmin === true;

  // 👇 マネージャー判定：誰かの上司になっているか？
  const isManager = React.useMemo(() => {
    if (!currentUser) return false;
    return members.some(m => m.managerId === currentUser.id);
  }, [members, currentUser]);

  // 👇 表示するメンバーのフィルターロジック
  const visibleMembers = React.useMemo(() => {
    if (!currentUser) return [];

    // 1. 管理者の場合
    if (isAdmin) {
      if (adminViewScope === 'all') return members; // 全員表示
      return members.filter(m => m.managerId === currentUser.id); // 自チームのみ
    }

    // 2. マネージャーの場合
    if (isManager) {
      return members.filter(m => m.managerId === currentUser.id); // 自チームのみ
    }

    // 3. 一般メンバーの場合
    return []; // サイドバーで隠されるけど、念のため空配列
  }, [members, currentUser, isAdmin, isManager, adminViewScope]);

  // 👇 ログのフィルター
  const visibleLogs = React.useMemo(() => {
    const visibleMemberIds = new Set(visibleMembers.map(m => m.id));
    return logs.filter(l => visibleMemberIds.has(l.memberId));
  }, [logs, visibleMembers]);

  // 画面遷移ヘルパー関数
  const navigate = (view: View) => {
    setState({ view });
    if (view !== 'editor') {
      setSelectedLog(null);
    }
  };

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    navigate('member-detail'); // 👈 ここを変更！
  };

  const handleCreateLog = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      setSelectedMember(member);
      setSelectedLog(null);
      navigate('editor');
    }
  };

  const handleSelectLog = (log: Log) => {
    const member = members.find(m => m.id === log.memberId);
    if (member) {
      setSelectedMember(member);
      setSelectedLog(log);
      navigate('editor');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <LoginPage />;

  return (
    <div className="flex min-h-screen">
      {/* 👇 修正：Sidebarに isManager を渡すのを忘れずに！ */}
      <Sidebar 
        currentView={state.view} 
        onNavigate={navigate} 
        isAdmin={isAdmin} 
        isManager={isManager} 
      />
      
      <main className="flex-1 ml-64 p-8 bg-slate-50 overflow-y-auto">
        {state.view === 'dashboard' && (
          <Dashboard 
            members={visibleMembers} 
            logs={visibleLogs} 
            onSelectLog={handleSelectLog}
            onCreateLog={handleCreateLog}
            // 👇 修正：切り替えスイッチ情報を渡す！
            isAdmin={isAdmin}
            viewScope={adminViewScope}
            onToggleScope={setAdminViewScope}
          />
        )}
        
        {state.view === 'members' && (
          <MemberView 
            members={visibleMembers}
            allMembers={members}     // 👈 【追加】Firestoreから取ったそのままの全リスト！ 
            logs={visibleLogs}
            memberId={selectedMember?.id || null}
            onSelectMember={handleSelectMember}
            onSelectLog={handleSelectLog}
            onCreateLog={handleCreateLog}
            // 👇 修正：MemberViewにもスイッチ情報を渡す！
            isAdmin={isAdmin}
            viewScope={adminViewScope}
            onToggleScope={setAdminViewScope}
          />
        )}

        {/* 👇 3. 詳細画面の表示を追加！ */}
        {state.view === 'member-detail' && selectedMember && (
          <MemberDetail 
            member={selectedMember}
            allMembers={members} // 上司名表示用
            logs={logs}          // 履歴表示用
            onBack={() => navigate('members')}
            onEditLog={handleSelectLog}
          />
        )}

        {state.view === 'editor' && selectedMember && (
          <LogEditor 
            member={selectedMember} 
            initialLog={selectedLog}
            onBack={() => navigate('members')}
            onSave={() => navigate('members')}
          />
        )}

        {state.view === 'my-history' && (
          <MyHistory members={members} logs={logs} />
        )}

        {state.view === 'profile' && (
          <MyProfile members={members} />
        )}
      </main>
    </div>
  );
};

export default App;