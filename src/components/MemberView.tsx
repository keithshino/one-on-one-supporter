// src/components/MemberView.tsx
import React, { useState } from 'react';
import { Member, Log } from '../types';
import { Plus, User, Briefcase, X, Loader2, UserPlus, Cloud, Trash2 } from 'lucide-react';
import { addMemberToFirestore, deleteMemberFromFirestore } from '../lib/firestore'; // 👈 インポート追加

interface MemberViewProps {
  members: Member[];
  logs: Log[];
  memberId: string | null;
  onSelectMember: (member: Member) => void;
  onSelectLog: (log: Log) => void;
  onCreateLog: (memberId: string) => void;
  // 👇 メンバーを追加したら、親(App.tsx)に「再読み込みして！」って伝える用
  onMemberAdded?: () => void; 
}

// ⚠️ onMemberAdded を受け取るように変更！
export const MemberView: React.FC<MemberViewProps> = ({ 
  members, logs, memberId, onSelectMember, onSelectLog, onCreateLog, onMemberAdded 
}) => {
  const selectedMember = members.find(m => m.id === memberId);
  const memberLogs = logs.filter(l => l.memberId === memberId);

  // メンバー追加モードかどうか
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("");

  // メンバー保存処理
  const handleAddMember = async () => {
    if (!newMemberName || !newMemberRole) return;
    
    try {
      setIsSubmitting(true);
      await addMemberToFirestore(newMemberName, newMemberRole);
      
      setIsAdding(false);
      setNewMemberName("");
      setNewMemberRole("");
      
      // 親(App.tsx)に「データ増えたよ！再読み込み頼む！」と伝える
      if (onMemberAdded) {
         // ここは実はApp.tsx側で対応が必要。今回は簡易的にリロードで対応するか、
         // App.tsxで onMemberAdded を渡すように修正するのがベスト。
         // いったん「alert」で誤魔化さず、リロードを促すか、App.tsxを直すか...
         // ★今回は一番簡単な「ブラウザリロード」でデータを反映させるばい！
         window.location.reload(); 
      }
    } catch (error) {
      alert("追加に失敗した...");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 👇 【追加】削除ボタンを押したときの処理
  const handleDeleteMember = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation(); // これがないと、削除ボタンを押したのに行自体をクリックしたことになっちゃう！
    
    if (window.confirm(`本当に「${name}」さんを削除してもよか？\n（※この操作は取り消せんばい！）`)) {
      try {
        await deleteMemberFromFirestore(id);
        // 簡単のためリロードで反映！
        window.location.reload();
      } catch (error) {
        alert("削除に失敗した...");
      }
    }
  };

  return (
    <div className="flex h-full gap-6">
      {/* 左側：メンバーリスト */}
      <div className="w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="font-bold text-slate-700">メンバー一覧</h2>
          
          {/* 👇 メンバー追加ボタン */}
          <button 
            onClick={() => setIsAdding(true)}
            className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors"
            title="メンバーを追加"
          >
            <UserPlus size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 p-2 space-y-2">
          {members.map(member => (
            <button
              key={member.id}
              onClick={() => onSelectMember(member)}
              className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all ${
                selectedMember?.id === member.id
                  ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200 shadow-sm'
                  : 'hover:bg-slate-50 border border-transparent'
              }`}
            >
              <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full bg-slate-200 object-cover" />
              <div>
                <p className="font-bold text-slate-800">{member.name}</p>
                <p className="text-xs text-slate-500">{member.role}</p>
              </div>

              {/* 👇 【追加】ゴミ箱ボタン（ホバーした時だけ出るように group-hover を使用） */}
              <div 
                onClick={(e) => handleDeleteMember(e, member.id, member.name)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                title="削除"
              >
                <Trash2 size={16} />
              </div>

            </button>
          ))}
        </div>
      </div>

      {/* 右側：詳細 or 追加フォーム */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-y-auto">
        
        {/* 👇 メンバー追加フォーム（isAddingがONのときだけ表示） */}
        {isAdding ? (
          <div className="max-w-md mx-auto mt-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <UserPlus className="text-blue-500" /> 新しいメンバーを追加
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">名前</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full pl-10 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="例：山田 太郎"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">役職 / ロール</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="w-full pl-10 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="例：Frontend Engineer"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                >
                  キャンセル
                </button>
                <button 
                  onClick={handleAddMember}
                  disabled={!newMemberName || !newMemberRole || isSubmitting}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "登録する"}
                </button>
              </div>
            </div>
          </div>
        ) : selectedMember ? (
          // 👇 ここは今まで通りの詳細表示
          <>
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <img src={selectedMember.avatar} alt={selectedMember.name} className="w-20 h-20 rounded-full bg-slate-100 object-cover shadow-sm" />
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{selectedMember.name}</h2>
                  <p className="text-slate-500 font-medium">{selectedMember.role}</p>
                </div>
              </div>
              <button 
                onClick={() => onCreateLog(selectedMember.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 transition-all"
              >
                <Plus size={20} /> 新規ログ作成
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                🕒 1on1 履歴
              </h3>
              {memberLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  まだ記録がありません
                </div>
              ) : (
                memberLogs.map(log => (
                  <div key={log.id} onClick={() => onSelectLog(log)} className="bg-white border border-slate-100 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${log.isPlanned ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                          {log.isPlanned ? '予定' : '実施済み'}
                        </span>
                        <span className="text-slate-500 font-medium">{log.date}</span>
                      </div>
                      <Cloud className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                    </div>
                    {log.summary ? (
                       <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                         <span className="font-bold text-slate-400 text-xs block mb-1">Summary</span>
                         {log.summary}
                       </div>
                    ) : (
                       <p className="text-slate-600 line-clamp-2">{log.good}</p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">Next Action</span>
                      <span className="text-xs text-slate-600 truncate flex-1 pt-1">{log.nextAction}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <User size={48} className="mb-4 text-slate-300" />
            <p>左のリストからメンバーを選択するか、<br/>追加ボタンで新しいメンバーを登録してください</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 👇 これ大事！ default export にしておく！
export default MemberView;
