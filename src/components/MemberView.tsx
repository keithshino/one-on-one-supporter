
import React, { useState } from 'react';
import { Member, Log, Mood } from '../types';

interface MemberViewProps {
  members: Member[];
  logs: Log[];
  onSelectMember: (member: Member) => void;
  onSelectLog: (log: Log) => void;
  onCreateLog: (memberId: string) => void;
}

const MoodIcon = ({ mood }: { mood: Mood }) => {
  switch (mood) {
    case 'sunny': return <span>☀️</span>;
    case 'cloudy': return <span>☁️</span>;
    case 'rainy': return <span>🌧️</span>;
    case 'stormy': return <span>⚡</span>;
    default: return null;
  }
};

const MemberView: React.FC<MemberViewProps> = ({ members, logs, onSelectLog, onCreateLog }) => {
  const [selectedId, setSelectedId] = useState<string | null>(members[0]?.id || null);

  const selectedMember = members.find(m => m.id === selectedId);
  const memberLogs = logs
    .filter(l => l.memberId === selectedId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
      {/* Member Sidebar */}
      <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-2">
        <h2 className="text-xl font-bold text-slate-800 px-2 mb-2">メンバー一覧</h2>
        {members.map(member => (
          <button
            key={member.id}
            onClick={() => setSelectedId(member.id)}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
              selectedId === member.id 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'bg-white border-slate-200 text-slate-800 hover:border-indigo-300'
            }`}
          >
            <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full border-2 border-white/20" />
            <div>
              <p className="font-bold">{member.name}</p>
              <p className={`text-xs ${selectedId === member.id ? 'text-indigo-100' : 'text-slate-500'}`}>{member.role}</p>
            </div>
          </button>
        ))}
      </div>

      {/* History Detail */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        {selectedMember ? (
          <>
            <header className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-6">
                <img src={selectedMember.avatar} alt={selectedMember.name} className="w-20 h-20 rounded-2xl border-4 border-white shadow-sm" />
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">{selectedMember.name}</h3>
                  <p className="text-slate-500">{selectedMember.role}</p>
                </div>
              </div>
              <button
                onClick={() => onCreateLog(selectedMember.id)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-transform active:scale-95 shadow-md shadow-indigo-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                新規ログ作成
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <h4 className="font-bold text-slate-700 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                1on1 履歴
              </h4>
              <div className="grid gap-4">
                {memberLogs.length > 0 ? memberLogs.map(log => (
                  <div 
                    key={log.id} 
                    onClick={() => onSelectLog(log)}
                    className="p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${log.isPlanned ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {log.isPlanned ? '予定' : '実施済み'}
                        </span>
                        <p className="text-slate-500 font-medium">
                          {new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' }).format(new Date(log.date))}
                        </p>
                      </div>
                      {!log.isPlanned && <div className="text-2xl"><MoodIcon mood={log.mood} /></div>}
                    </div>
                    {log.isPlanned ? (
                      <p className="text-slate-400 italic">準備中のメモはありません</p>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <span className="text-xs font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-500">Summary</span>
                          <p className="text-sm text-slate-700 line-clamp-2">{log.summary || 'サマリー未作成'}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-xs font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-500">Next Action</span>
                          <p className="text-sm text-slate-700 line-clamp-1">{log.nextAction || '未設定'}</p>
                        </div>
                      </div>
                    )}
                    <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-indigo-600 text-sm font-bold flex items-center gap-1">
                        詳細を見る <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl">
                    <p className="text-slate-400">過去の履歴がありません</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
            <svg className="w-20 h-20 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p>メンバーを選択してください</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberView;
