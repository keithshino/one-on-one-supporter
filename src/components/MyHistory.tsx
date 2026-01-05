// src/components/MyHistory.tsx
import React from 'react';
import { Member, Log } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Cloud, Calendar, User, History } from 'lucide-react';

interface MyHistoryProps {
  members: Member[];
  logs: Log[];
}

const MyHistory: React.FC<MyHistoryProps> = ({ members, logs }) => {
  const { user } = useAuth();

  // 1. ログイン中のユーザーのメアドと一致する「メンバー情報」を探す
  const myMemberProfile = members.find(m => m.email === user?.email);

  // 2. そのメンバーIDに紐づくログを探す
  const myLogs = myMemberProfile 
    ? logs.filter(l => l.memberId === myMemberProfile.id) 
    : [];

  if (!user) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <History className="text-blue-500" />
          My 1on1 History
        </h1>
        <p className="text-slate-500 mt-2">あなた自身の1on1の振り返りです。</p>
      </header>

      {!myMemberProfile ? (
        <div className="bg-yellow-50 text-yellow-800 p-6 rounded-xl border border-yellow-200">
          <p className="font-bold flex items-center gap-2">⚠️ 連携されていません</p>
          <p className="mt-2 text-sm">
            あなたのメールアドレス ({user.email}) で登録されたメンバー情報が見つかりませんでした。<br/>
            マネージャーに、あなたのメールアドレスを登録してもらうよう依頼してください。
          </p>
        </div>
      ) : myLogs.length === 0 ? (
        <div className="text-center p-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <p className="text-slate-400">まだ1on1の記録がありません。</p>
        </div>
      ) : (
        <div className="space-y-6">
          {myLogs.map(log => (
            <div key={log.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-50">
                <Calendar className="text-blue-500" size={20} />
                <span className="font-bold text-lg text-slate-700">{log.date}</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${log.isPlanned ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                  {log.isPlanned ? '予定' : '実施済み'}
                </span>
              </div>
              
              <div className="space-y-4">
                {log.summary && (
                  <div className="bg-blue-50 p-4 rounded-lg text-slate-700 text-sm leading-relaxed">
                    <span className="font-bold text-blue-600 block mb-1">💡 AI要約</span>
                    {log.summary}
                  </div>
                )}
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs font-bold text-green-600 block mb-1">Good</span>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg min-h-[80px]">{log.good}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-blue-600 block mb-1">More</span>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg min-h-[80px]">{log.more}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-purple-600 block mb-1">Next Action</span>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg min-h-[80px]">{log.nextAction}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyHistory;