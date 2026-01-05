// src/components/MemberView.tsx
import React, { useState } from 'react';
import { Member, Log } from '../types';
import { Plus, User, Briefcase, X, Loader2, UserPlus, Cloud, Trash2, Pencil, Filter } from 'lucide-react'; // Pencil, Filter 追加
import { addMemberToFirestore, deleteMemberFromFirestore, updateMemberInFirestore } from '../lib/firestore'; // update追加
import { useAuth } from '../contexts/AuthContext'; // 👈 自分のIDを知るために必要！

interface MemberViewProps {
  members: Member[];
  logs: Log[];
  memberId: string | null;
  onSelectMember: (member: Member) => void;
  onSelectLog: (log: Log) => void;
  onCreateLog: (memberId: string) => void;
  onMemberAdded?: () => void;
}

export const MemberView: React.FC<MemberViewProps> = ({ 
  members, logs, memberId, onSelectMember, onSelectLog, onCreateLog, onMemberAdded 
}) => {
  const { user } = useAuth(); // 👈 ログイン中のユーザー情報GET
  const selectedMember = members.find(m => m.id === memberId);
  const memberLogs = logs.filter(l => l.memberId === memberId);

  // 編集・追加モードの状態管理
  const [mode, setMode] = useState<'view' | 'add' | 'edit'>('view');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // フォーム用データ
  const [formData, setFormData] = useState({ id: '', name: '', role: '' });
  
  // フィルター用（自分のチームだけ見るか？）
  const [showOnlyMyTeam, setShowOnlyMyTeam] = useState(false);

  // 表示するメンバーをフィルタリング
  const displayedMembers = showOnlyMyTeam && user
    ? members.filter(m => m.managerId === user.uid)
    : members;

  // 追加ボタンを押した時
  const startAdd = () => {
    setFormData({ id: '', name: '', role: '' });
    setMode('add');
  };

  // 編集ボタンを押した時
  const startEdit = (e: React.MouseEvent, member: Member) => {
    e.stopPropagation();
    setFormData({ id: member.id, name: member.name, role: member.role });
    setMode('edit');
  };

  // 保存処理（追加と更新を分岐！）
  const handleSave = async () => {
    if (!formData.name || !formData.role) return;
    
    try {
      setIsSubmitting(true);
      
      if (mode === 'add') {
        // 新規追加：自分のIDをmanagerIdとして紐づける！
        await addMemberToFirestore(formData.name, formData.role, user?.uid || "");
      } else {
        // 更新：IDを使って書き換え
        await updateMemberInFirestore(formData.id, {
          name: formData.name,
          role: formData.role
          // ここで managerId を書き換えれば「担当変更」もできるけど、今回は名前と役職のみ修正
        });
      }
      
      setMode('view');
      window.location.reload(); // 手抜きリロードで反映！
    } catch (error) {
      alert("保存に失敗した...");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (window.confirm(`本当に「${name}」さんを削除してもよか？`)) {
      try {
        await deleteMemberFromFirestore(id);
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
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-700">メンバー</h2>
            {/* 👇 フィルターボタン */}
            <button 
              onClick={() => setShowOnlyMyTeam(!showOnlyMyTeam)}
              className={`p-1.5 rounded-md transition-all ${showOnlyMyTeam ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-slate-200'}`}
              title="自分のチームのみ表示"
            >
              <Filter size={16} />
            </button>
          </div>
          
          <button 
            onClick={startAdd}
            className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors"
            title="メンバーを追加"
          >
            <UserPlus size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 p-2 space-y-2">
          {displayedMembers.length === 0 ? (
             <div className="text-center p-4 text-slate-400 text-sm">
               {showOnlyMyTeam ? "あなたの担当メンバーはいません" : "メンバーがいません"}
             </div>
          ) : (
            displayedMembers.map(member => (
              <button
                key={member.id}
                onClick={() => onSelectMember(member)}
                className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all group ${
                  selectedMember?.id === member.id
                    ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200 shadow-sm'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="relative">
                  <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full bg-slate-200 object-cover" />
                  {/* 👇 自分の部下なら青いバッジをつける */}
                  {user && member.managerId === user.uid && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full" title="My Team"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate">{member.name}</p>
                  <p className="text-xs text-slate-500 truncate">{member.role}</p>
                </div>

                {/* 操作ボタンたち */}
                <div className="flex gap-1">
                  {/* ✏️ 編集ボタン */}
                  <div 
                    onClick={(e) => startEdit(e, member)}
                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all"
                    title="編集"
                  >
                    <Pencil size={16} />
                  </div>
                  {/* 🗑 ゴミ箱ボタン */}
                  <div 
                    onClick={(e) => handleDeleteMember(e, member.id, member.name)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    title="削除"
                  >
                    <Trash2 size={16} />
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* 右側：詳細 or フォーム */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-y-auto">
        
        {/* 👇 入力フォーム（追加・編集共通！） */}
        {mode !== 'view' ? (
          <div className="max-w-md mx-auto mt-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              {mode === 'add' ? <UserPlus className="text-blue-500" /> : <Pencil className="text-blue-500" />}
              {mode === 'add' ? '新しいメンバーを追加' : 'メンバー情報を編集'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">名前</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full pl-10 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="例：Frontend Engineer"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setMode('view')}
                  className="flex-1 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                >
                  キャンセル
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!formData.name || !formData.role || isSubmitting}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : (mode === 'add' ? "登録する" : "更新する")}
                </button>
              </div>
            </div>
          </div>
        ) : selectedMember ? (
          // 👇 詳細表示（変更なし）
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
             {/* ログ一覧はそのまま... */}
             <div className="space-y-4">
               {memberLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">まだ記録がありません</div>
               ) : (
                memberLogs.map(log => (
                  <div key={log.id} onClick={() => onSelectLog(log)} className="bg-white border border-slate-100 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-slate-500 font-medium flex items-center gap-2"><Cloud size={16}/> {log.date}</span>
                    </div>
                    {log.summary ? (
                       <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">{log.summary}</div>
                    ) : (
                       <p className="text-slate-600 line-clamp-2">{log.good}</p>
                    )}
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

export default MemberView;