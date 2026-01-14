// src/App.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LogOut, LayoutDashboard, Users, Contact, User, History } from 'lucide-react'; // アイコン追加

// コンポーネントのインポート
import { LoginPage } from './components/LoginPage';
import { MemberView } from './components/MemberView';
import { LogEditor } from './components/LogEditor';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MyHistory from './components/MyHistory';
import MyProfile from './components/MyProfile';
import { MemberDetail } from './components/MemberDetail';
import { ProfileList } from './components/ProfileList';
import { AllHistory } from './components/AllHistory';

// 型とFirebase関連
import { Member, Log, View } from './types';
import { db } from './lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const App: React.FC = () => {
  const { user, loading, logout } = useAuth();
  
  // 画面遷移やデータ保持用のState
  const [state, setState] = useState<{ view: View }>({ view: 'dashboard' });
  const [members, setMembers] = useState<Member[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  
  // 👇 修正1: メンバーデータの読み込み中フラグを追加（チラつき防止）
  const [isMembersLoading, setIsMembersLoading] = useState(true);
  
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  // 管理者用の表示切り替えスイッチ
  const [adminViewScope, setAdminViewScope] = useState<'all' | 'team'>('all');

  // データ取得 (useEffect)
  useEffect(() => {
    if (!user) {
      setIsMembersLoading(false); // ユーザーがいないならロード終了扱いでOK
      return;
    }

    // メンバー取得
    const unsubscribeMembers = onSnapshot(collection(db, "members"), (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member));
      setMembers(membersData);
      setIsMembersLoading(false); // 👇 データが届いたらロード完了！
    });

    // ログ取得
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

  // マネージャー判定
  const isManager = React.useMemo(() => {
    if (!currentUser) return false;
    return members.some(m => m.managerId === currentUser.id);
  }, [members, currentUser]);

  // 表示するメンバーのフィルターロジック
  const visibleMembers = React.useMemo(() => {
    if (!currentUser) return [];
    if (isAdmin) {
      if (adminViewScope === 'all') return members;
      return members.filter(m => m.managerId === currentUser.id);
    }
    if (isManager) {
      return members.filter(m => m.managerId === currentUser.id);
    }
    return [];
  }, [members, currentUser, isAdmin, isManager, adminViewScope]);

  // ログのフィルター
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
    navigate('member-detail');
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

  // 「詳細画面で見せてもいいログ」を計算する
  const visibleLogsForDetail = React.useMemo(() => {
    if (!selectedMember || !currentUser) return [];
    if (selectedMember.id === currentUser.id) return logs.filter(l => l.memberId === selectedMember.id);
    if (isAdmin) return logs.filter(l => l.memberId === selectedMember.id);
    if (selectedMember.managerId === currentUser.id) return logs.filter(l => l.memberId === selectedMember.id);
    return [];
  }, [selectedMember, currentUser, isAdmin, logs]);

  // 👇 スマホ用の下部メニュー部品
  const MobileMenu = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 flex justify-around z-50 md:hidden pb-safe">
      <button 
        onClick={() => setState(prev => ({ ...prev, view: 'dashboard' }))}
        className={`flex flex-col items-center p-2 rounded-lg ${state.view === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}
      >
        <LayoutDashboard size={24} />
        <span className="text-[10px] font-bold mt-1">ダッシュボード</span>
      </button>

      <button 
        onClick={() => setState(prev => ({ ...prev, view: 'members' }))}
        className={`flex flex-col items-center p-2 rounded-lg ${state.view === 'members' ? 'text-blue-600' : 'text-slate-400'}`}
      >
        <Users size={24} />
        <span className="text-[10px] font-bold mt-1">メンバー</span>
      </button>

      <button 
        onClick={() => setState(prev => ({ ...prev, view: 'profile-list' }))}
        className={`flex flex-col items-center p-2 rounded-lg ${state.view.includes('profile') ? 'text-blue-600' : 'text-slate-400'}`}
      >
        <Contact size={24} />
        <span className="text-[10px] font-bold mt-1">プロフィール</span>
      </button>

      <button 
        onClick={() => {
          setSelectedMember(null);
          setState(prev => ({ ...prev, view: 'profile' }));
        }}
        className={`flex flex-col items-center p-2 rounded-lg ${state.view === 'profile' && !selectedMember ? 'text-blue-600' : 'text-slate-400'}`}
      >
        <User size={24} />
        <span className="text-[10px] font-bold mt-1">マイページ</span>
      </button>
    </div>
  );

  // ローディング判定
  if (loading || (user && isMembersLoading)) { // 修正：メンバー読込中もローディング画面を出す
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) return <LoginPage />;

  // ガード処理: ログインしてるけど、メンバー登録がない人はブロック！
  // 修正：isMembersLoadingのチェックは上で済ませているので、ここでは !currentUser だけで確実
  if (user && !currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">アクセス権限がありません</h1>
          <p className="text-slate-500 mb-8">
            あなたのアカウント ({user.email}) はメンバーリストに登録されていません。<br/>
            利用するには管理者に登録を依頼してください。
          </p>
          <button 
            onClick={logout}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            ログアウトして戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* 💻 PC用サイドバー */}
      <div className="hidden md:block">
        <Sidebar 
          currentView={state.view} 
          onNavigate={(view) => {
            if (view === 'profile') {
              setSelectedMember(null);
            }
            setState(prev => ({ ...prev, view: view }));
          }} 
          isAdmin={isAdmin} 
          isManager={isManager}
          currentUser={currentUser} 
        />
      </div>
      
      {/* 📱 スマホ用ボトムナビ */}
      <MobileMenu />

      {/* メインエリア */}
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto w-full">
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

        {state.view === 'profile-list' && (
          <ProfileList 
            members={members} 
            onSelectMember={(member) => {
              setSelectedMember(member);
              setState(prev => ({ ...prev, view: 'profile' }));
            }}
          />
        )}

        {state.view === 'member-detail' && selectedMember && (
          <MemberDetail 
            member={selectedMember}
            allMembers={members}
            logs={visibleLogsForDetail}
            onBack={() => setState(prev => ({ ...prev, view: 'members' }))}
            onEditLog={handleSelectLog}
          />
        )}

        {state.view === 'editor' && selectedMember && (
          <LogEditor 
            member={selectedMember} 
            initialLog={selectedLog}
            onBack={() => setState(prev => ({ ...prev, view: 'member-detail' }))}
            onSave={() => {
              setState(prev => ({ ...prev, view: 'member-detail' }));
            }}
          />
        )}

        {state.view === 'my-history' && (
          <MyHistory members={members} logs={logs} />
        )}

        {state.view === 'profile' && (
          <MyProfile 
            members={members} 
            targetMember={selectedMember} 
            onBack={selectedMember ? () => setState(prev => ({ ...prev, view: 'profile-list' })) : undefined}
          />
        )}

        {state.view === 'all-history' && (
          <AllHistory 
            logs={visibleLogs} 
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