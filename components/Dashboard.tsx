
import React from 'react';
import Calendar from './Calendar';
import { Log, Member, Mood } from '../types';

interface DashboardProps {
  logs: Log[];
  members: Member[];
  onSelectLog: (log: Log) => void;
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

const Dashboard: React.FC<DashboardProps> = ({ logs, members, onSelectLog }) => {
  const upcoming = logs
    .filter(l => l.isPlanned && new Date(l.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const history = logs
    .filter(l => !l.isPlanned)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || '不明';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">ダッシュボード</h2>
        <p className="text-slate-500">現在のステータスと今後の予定を確認します。</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Calendar logs={logs} />
        </div>

        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                Upcoming（今後の予定）
              </h3>
            </div>
            <div className="grid gap-3">
              {upcoming.length > 0 ? upcoming.map(log => (
                <div key={log.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-indigo-300 transition-colors cursor-pointer group" onClick={() => onSelectLog(log)}>
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg text-center min-w-[60px]">
                      <p className="text-xs font-bold uppercase">{new Intl.DateTimeFormat('ja-JP', { month: 'short' }).format(new Date(log.date))}</p>
                      <p className="text-lg font-black leading-tight">{new Date(log.date).getDate()}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{getMemberName(log.memberId)}</p>
                      <p className="text-sm text-slate-500">{new Intl.DateTimeFormat('ja-JP', { hour: '2-digit', minute: '2-digit' }).format(new Date(log.date))} 〜</p>
                    </div>
                  </div>
                  <button className="text-slate-300 group-hover:text-indigo-500 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )) : (
                <p className="text-slate-400 text-sm italic py-4">予定されている1on1はありません</p>
              )}
            </div>
          </section>

          {/* Recent History Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                Recent History（最近の履歴）
              </h3>
            </div>
            <div className="grid gap-3">
              {history.length > 0 ? history.map(log => (
                <div key={log.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-emerald-300 transition-colors cursor-pointer group" onClick={() => onSelectLog(log)}>
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg text-xl flex items-center justify-center w-12 h-12">
                      <MoodIcon mood={log.mood} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{getMemberName(log.memberId)}</p>
                      <p className="text-sm text-slate-500">{new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(log.date))}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 mb-1">サマリー</p>
                    <p className="text-sm text-slate-600 max-w-[300px] truncate">{log.summary || 'サマリーなし'}</p>
                  </div>
                </div>
              )) : (
                <p className="text-slate-400 text-sm italic py-4">履歴はありません</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
