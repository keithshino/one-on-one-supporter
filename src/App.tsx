// src/App.tsx
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useAuth } from './contexts/AuthContext';

// 👇 修正1：波括弧 { } をしっかりつける！
import { LoginPage } from './components/LoginPage';
import { MemberView } from './components/MemberView';
import { LogEditor } from './components/LogEditor';

import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MyHistory from './components/MyHistory';
import MyProfile from './components/MyProfile';

import { Member, Log, View } from './types';
import { db } from './lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [state, setState] = useState<{ view: View }>({ view: 'dashboard' });
  const [members, setMembers] = useState<Member[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

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

  const currentUser = members.find(m => m.email === user?.email);
  const isAdmin = currentUser?.isAdmin === true;

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <LoginPage />;

  const navigate = (view: View) => {
    setState({ view });
    if (view !== 'editor') {
      setSelectedLog(null);
    }
  };

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
  };

  const handleCreateLog = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      setSelectedMember(member);
      setSelectedLog(null);
      navigate('editor');
    }
  };

  // 👇 これをダッシュボードにも渡す必要がある！
  const handleSelectLog = (log: Log) => {
    const member = members.find(m => m.id === log.memberId);
    if (member) {
      setSelectedMember(member);
      setSelectedLog(log);
      navigate('editor');
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar currentView={state.view} onNavigate={navigate} isAdmin={isAdmin} />
      
      <main className="flex-1 ml-64 p-8 bg-slate-50 overflow-y-auto">
        {state.view === 'dashboard' && (
          <Dashboard 
            members={members} 
            logs={logs} 
            // 👇 修正2：ここ！この行を追加しないとダッシュボードが怒る！
            onSelectLog={handleSelectLog} 
          />
        )}
        
        {state.view === 'members' && (
          <MemberView 
            members={members} 
            logs={logs}
            memberId={selectedMember?.id || null}
            onSelectMember={handleSelectMember}
            onSelectLog={handleSelectLog}
            onCreateLog={handleCreateLog}
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