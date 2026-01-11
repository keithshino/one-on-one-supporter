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
import { ProfileList } from './components/ProfileList';
import { AllHistory } from './components/AllHistory';

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

  // 「詳細画面で見せてもいいログ」を計算する
  const visibleLogsForDetail = React.useMemo(() => {
    if (!selectedMember || !currentUser) return [];

    // ① 自分自身のログなら全部OK
    if (selectedMember.id === currentUser.id) return logs.filter(l => l.memberId === selectedMember.id);
    
    // ② 管理者なら全部OK
    if (isAdmin) return logs.filter(l => l.memberId === selectedMember.id);

    // ③ マネージャーで、かつ相手が部下ならOK
    if (selectedMember.managerId === currentUser.id) return logs.filter(l => l.memberId === selectedMember.id);

    // ④ それ以外（同僚など）は、ログは見せない！空配列を返す
    return [];
  }, [selectedMember, currentUser, isAdmin, logs]);

  return (
    <div className="flex min-h-screen">
      {/* 👇 修正：Sidebarに isManager を渡すのを忘れずに！ */}
      <Sidebar 
        currentView={state.view} 
        onNavigate={(view) => {
          // 👇 1. Sidebarから「マイプロフィール(profile)」を押したら、自分を表示したいので selectedMember を null にする
          if (view === 'profile') {
            setSelectedMember(null);
          }
          // ⚠️ 修正ポイント1: setStateは「前の状態(prev)」を受け取って「新しい状態」を返す書き方にする！
          setState(prev => ({ ...prev, view: view }));
        }} 
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
            isAdmin={isAdmin}
            viewScope={adminViewScope}
            onToggleScope={setAdminViewScope}
            onSeeAllLogs={() => setState(prev => ({ ...prev, view: 'all-history' }))}
          />
        )}
        
        {state.view === 'members' && (
          <MemberView 
            members={visibleMembers}
            allMembers={members}
            logs={visibleLogs}
            memberId={selectedMember?.id || null}
            onSelectMember={handleSelectMember}
            onSelectLog={handleSelectLog}
            onCreateLog={handleCreateLog}
            isAdmin={isAdmin}
            viewScope={adminViewScope}
            onToggleScope={setAdminViewScope}
          />
        )}

        {/* 👇 3. プロフィール一覧画面の表示 */}
        {state.view === 'profile-list' && (
          <ProfileList 
            members={members} 
            onSelectMember={(member) => {
              // 👇 2. 一覧からクリックしたら、その人をセットして「profile」画面へ！
              setSelectedMember(member);
              // ⚠️ 修正ポイント2: ここも setState を正しく使う
              setState(prev => ({ ...prev, view: 'profile' }));
            }}
          />
        )}

        {/* 👇 3. 詳細画面の表示 */}
        {state.view === 'member-detail' && selectedMember && (
          <MemberDetail 
            member={selectedMember}
            allMembers={members}
            logs={visibleLogsForDetail}
            // ⚠️ 修正ポイント3: navigate関数がないかもしれないので、setStateで直接指定！
            // (一旦シンプルに members に戻るように設定してるけど、必要なら profile-list に変えてもOK)
            onBack={() => setState(prev => ({ ...prev, view: 'members' }))}
            onEditLog={handleSelectLog}
          />
        )}

        {state.view === 'editor' && selectedMember && (
          <LogEditor 
            member={selectedMember} 
            initialLog={selectedLog}
            // ⚠️ 修正ポイント4: ここも setState で統一
            onBack={() => setState(prev => ({ ...prev, view: 'member-detail' }))}
            onSave={() => {
              // 保存後は再読み込みなどの処理が必要ならここに入れる
              setState(prev => ({ ...prev, view: 'member-detail' }));
            }}
          />
        )}

        {state.view === 'my-history' && (
          <MyHistory members={members} logs={logs} />
        )}

        {state.view === 'profile' && (
          // 👇 3. targetMember に selectedMember を渡す！
          <MyProfile 
            members={members} 
            targetMember={selectedMember} 
            // ⚠️ 修正ポイント5: ここも setState で統一！
            // selectedMemberがいる(=一覧から来た)なら一覧へ、いない(=自分の編集)なら undefined
            onBack={selectedMember ? () => setState(prev => ({ ...prev, view: 'profile-list' })) : undefined}
          />
        )}

        {state.view === 'all-history' && (
          <AllHistory 
            logs={visibleLogs} // 権限に応じてフィルタリング済みのログを渡す
            members={members}
            onBack={() => setState(prev => ({ ...prev, view: 'dashboard' }))}
            onSelectLog={handleSelectLog}
          />
        )}
      </main>
    </div>
  );
};

export default App;