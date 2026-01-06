import React from 'react';
import { Member, Log, Mood } from '../types';
import { ArrowLeft, Mail, Briefcase, UserCheck, Calendar, MapPin, Shield } from 'lucide-react';

interface MemberDetailProps {
  member: Member;
  allMembers: Member[]; // 上司の名前を探すために必要
  logs: Log[];
  onBack: () => void;
  onEditLog: (log: Log) => void;
}

const MoodIcon = ({ mood }: { mood?: Mood | string }) => {
  switch (mood) {
    case 'sunny': return <span>☀️</span>;
    case 'cloudy': return <span>☁️</span>;
    case 'rainy': return <span>🌧️</span>;
    case 'stormy': return <span>⚡</span>;
    default: return <span>☁️</span>;
  }
};

export const MemberDetail: React.FC<MemberDetailProps> = ({ 
  member, 
  allMembers,
  logs, 
  onBack, 
  onEditLog 
}) => {
  // このメンバーのログだけ抽出して日付順（新しい順）に並べる
  const memberLogs = logs
    .filter(l => l.memberId === member.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 上司の名前を取得
  const manager = allMembers.find(m => m.id === member.managerId);
  const managerName = manager ? manager.name : '未設定';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* 戻るボタン */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold"
      >
        <ArrowLeft size={20} />
        メンバーリストに戻る
      </button>

      {/* プロフィールカード */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="relative">
              <img 
                src={member.avatar} 
                alt={member.name} 
                className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md"
              />
              {member.isAdmin && (
                <div className="absolute bottom-0 right-0 bg-yellow-400 text-white p-1.5 rounded-full border-2 border-white shadow-sm" title="管理者">
                  <Shield size={14} fill="currentColor" />
                </div>
              )}
            </div>
            {/* ここに「ログ記録」ボタンなどを置いても便利かも */}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{member.name}</h1>
              <p className="text-slate-500 font-medium">{member.department || '部署未設定'} / {member.role || '役職なし'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="bg-slate-50 p-2 rounded-lg text-slate-400"><Mail size={18} /></div>
                <span className="font-medium">{member.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <div className="bg-slate-50 p-2 rounded-lg text-slate-400"><UserCheck size={18} /></div>
                <span className="font-medium">上司: {managerName}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <div className="bg-slate-50 p-2 rounded-lg text-slate-400"><Calendar size={18} /></div>
                <span className="font-medium">
                  次回予定: {member.nextMeetingDate ? new Date(member.nextMeetingDate).toLocaleDateString('ja-JP') : '未設定'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <div className="bg-slate-50 p-2 rounded-lg text-slate-400"><Briefcase size={18} /></div>
                <span className="font-medium">{memberLogs.length}回の1on1を実施</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 1on1履歴エリア */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
          1on1 履歴
        </h2>

        <div className="space-y-4">
          {memberLogs.length > 0 ? (
            memberLogs.map(log => (
              <div 
                key={log.id}
                onClick={() => onEditLog(log)}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2 rounded-xl text-2xl">
                      <MoodIcon mood={log.mood} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">
                        {new Date(log.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
                      </h3>
                      <p className="text-xs text-slate-400 font-bold">1on1 Log</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-slate-50 text-slate-500 text-xs font-bold rounded-full border border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    詳細を見る &gt;
                  </span>
                </div>

                <div className="space-y-3 pl-2 border-l-2 border-slate-100 ml-4">
                  {log.good && (
                    <div className="pl-4">
                      <p className="text-xs font-bold text-blue-600 mb-1">良かったこと / 共有事項</p>
                      <p className="text-slate-700 text-sm leading-relaxed line-clamp-2">{log.good}</p>
                    </div>
                  )}
                  {log.nextAction && (
                    <div className="pl-4">
                      <p className="text-xs font-bold text-emerald-600 mb-1">次のアクション</p>
                      <p className="text-slate-700 text-sm leading-relaxed line-clamp-1">{log.nextAction}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-400">まだ1on1の記録がありません。</p>
              <p className="text-sm text-slate-400 mt-2">定期的に話を聞いて、記録を残していきましょう！</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};