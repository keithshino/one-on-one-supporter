
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MemberView from './components/MemberView';
import LogEditor from './components/LogEditor';
import { View, Member, Log, AppState } from './types';
import { MOCK_MEMBERS, MOCK_LOGS } from './mockData';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    view: 'dashboard',
    selectedMemberId: null,
    editingLogId: null,
  });

  const [members] = useState<Member[]>(MOCK_MEMBERS);
  const [logs, setLogs] = useState<Log[]>(MOCK_LOGS);

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
    // Go back to the previous context
    setState(prev => ({ ...prev, view: 'members' }));
  };

  const currentMember = state.selectedMemberId ? members.find(m => m.id === state.selectedMemberId) : null;
  const currentLog = state.editingLogId ? logs.find(l => l.id === state.editingLogId) : null;

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
