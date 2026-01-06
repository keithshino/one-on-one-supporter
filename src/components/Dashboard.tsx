// src/components/Dashboard.tsx
import React from 'react';
import { Member, Log, Mood } from '../types';
import { Users, FileText, Calendar, TrendingUp, ArrowRight, AlertCircle, Cloud } from 'lucide-react';

interface DashboardProps {
  members: Member[];
  logs: Log[];
  onSelectLog: (log: Log) => void;
  onCreateLog: (memberId: string) => void;
  // 👇 追加
  isAdmin: boolean;
  viewScope: 'all' | 'team';
  onToggleScope: (scope: 'all' | 'team') => void;
}

const MoodIcon = ({ mood }: { mood?: Mood | string }) => {
  switch (mood) {
    case 'sunny': return <span className="text-2xl">☀️</span>;
    case 'cloudy': return <span className="text-2xl">☁️</span>;
    case 'rainy': return <span className="text-2xl">🌧️</span>;
    case 'stormy': return <span className="text-2xl">⚡</span>;
    default: return <Cloud className="text-slate-400" size={24} />;
  }
};

const Dashboard: React.FC<DashboardProps> = ({ 
  members, logs, onSelectLog, onCreateLog, 
  isAdmin, viewScope, onToggleScope // 👈 受け取る 
}) => {
  
    const totalMembers = members.length;
  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthLogs = logs.filter(log => log.date.startsWith(currentMonth));
  const logsCount = thisMonthLogs.length;

  const memberIdsWithLogs = new Set(logs.map(l => l.memberId));
  const neverHad1on1 = members.filter(m => !memberIdsWithLogs.has(m.id)).length;

  const upcomingMeetings = members
    .filter(m => m.nextMeetingDate && m.nextMeetingDate >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => (a.nextMeetingDate! > b.nextMeetingDate! ? 1 : -1))
    .slice(0, 3);

  const recentLogs = logs.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">ダッシュボード</h1>
          <p className="text-slate-500 mt-2">チームの状況をリアルタイムで確認できます。</p>
        </div>

        {/* 👇 管理者のみ表示する切り替えスイッチ */}
        {isAdmin && (
          <div className="bg-white border border-slate-200 p-1 rounded-lg flex text-sm font-bold shadow-sm">
            <button
              onClick={() => onToggleScope('all')}
              className={`px-4 py-2 rounded-md transition-all ${
                viewScope === 'all' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              全社
            </button>
            <button
              onClick={() => onToggleScope('team')}
              className={`px-4 py-2 rounded-md transition-all ${
                viewScope === 'team' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              自分のチーム
            </button>
          </div>
        )}
        
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold text-slate-600">{new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-xs text-slate-400">現在</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
          <div className="p-4 bg-blue-50 rounded-xl text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-bold">総メンバー数</p>
            <p className="text-3xl font-bold text-slate-800">{totalMembers}<span className="text-sm text-slate-400 font-normal ml-1">名</span></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
          <div className="p-4 bg-green-50 rounded-xl text-green-600">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-bold">今月の1on1実施</p>
            <p className="text-3xl font-bold text-slate-800">{logsCount}<span className="text-sm text-slate-400 font-normal ml-1">件</span></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
          <div className="p-4 bg-orange-50 rounded-xl text-orange-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-bold">未実施メンバー</p>
            <p className="text-3xl font-bold text-slate-800">{neverHad1on1}<span className="text-sm text-slate-400 font-normal ml-1">名</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 今後の予定 (Upcoming) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
              今後の予定
            </h3>
          </div>
          
          <div className="space-y-3">
            {upcomingMeetings.length > 0 ? (
              upcomingMeetings.map(member => (
                <div 
                  key={member.id} 
                  onClick={() => onCreateLog(member.id)}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg text-center min-w-[60px] group-hover:bg-indigo-100 transition-colors">
                    <p className="text-xs font-bold uppercase">{new Date(member.nextMeetingDate!).getMonth() + 1}月</p>
                    <p className="text-xl font-black leading-tight">{new Date(member.nextMeetingDate!).getDate()}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">{member.name}</p>
                    <p className="text-xs text-slate-500 truncate">{member.department || '部署未設定'}</p>
                  </div>
                  <div className="text-slate-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                    <ArrowRight size={20} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 italic text-sm">
                予定はありません
              </div>
            )}
          </div>
        </div>

        {/* 最近の履歴 (Recent History) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
              最近の履歴
            </h3>
            <button className="text-xs text-slate-400 hover:text-emerald-600 flex items-center gap-1 transition-colors">
              すべて見る <ArrowRight size={12}/>
            </button>
          </div>

          <div className="space-y-3">
            {recentLogs.length > 0 ? (
              recentLogs.map(log => {
                const member = members.find(m => m.id === log.memberId);
                return (
                  <div 
                    key={log.id} 
                    onClick={() => onSelectLog(log)}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center w-12 h-12 flex-shrink-0">
                        <MoodIcon mood={log.mood} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <p className="font-bold text-slate-800 truncate group-hover:text-emerald-700 transition-colors">
                            {member ? member.name : '不明なメンバー'}
                          </p>
                          <span className="text-xs text-slate-400">
                            {new Date(log.date).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 truncate mt-0.5">
                          {log.summary || log.good || '（サマリーなし）'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-slate-300 group-hover:text-emerald-500 transition-colors pl-4">
                      <ArrowRight size={20} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                まだ履歴がありません
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;