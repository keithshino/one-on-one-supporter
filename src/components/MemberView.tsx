// src/components/MemberView.tsx
import React, { useState } from 'react';
import { Member, Log } from '../types';
import { Plus, User, Briefcase, UserPlus, Cloud, Trash2, Pencil, Filter, Mail, Sparkles, Building2, Flag, ScrollText, RefreshCw, Camera, Loader2, ShieldCheck } from 'lucide-react'; // アイコン大量追加！
import { addMemberToFirestore, deleteMemberFromFirestore, updateMemberInFirestore } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';

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
  const { user } = useAuth();
  const selectedMember = members.find(m => m.id === memberId);
  const memberLogs = logs.filter(l => l.memberId === memberId);

  const [mode, setMode] = useState<'view' | 'add' | 'edit'>('view');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOnlyMyTeam, setShowOnlyMyTeam] = useState(false);

  // フォーム用データ（新項目も追加！）
  const [formData, setFormData] = useState({ 
    id: '', name: '', role: '', email: '', 
    department: '', dream: '', enthusiasm: '', career: '', avatar: '',
    isAdmin: false 
  });

  const displayedMembers = showOnlyMyTeam && user
    ? members.filter(m => m.managerId === user.uid)
    : members;

  const startAdd = () => {
    // 新規登録時はランダムアバターをセット
    const randomAvatar = `https://picsum.photos/seed/${Math.floor(Math.random() * 1000)}/200`;
    setFormData({ 
      id: '', name: '', role: '', email: '', 
      department: '', dream: '', enthusiasm: '', career: '', avatar: randomAvatar,
      isAdmin: false // デフォルトはfalse 
    });
    setMode('add');
  };

  const startEdit = (e: React.MouseEvent, member: Member) => {
    e.stopPropagation();
    setFormData({ 
      id: member.id, 
      name: member.name, 
      role: member.role, 
      email: member.email || '',
      department: member.department || '',
      dream: member.dream || '',
      enthusiasm: member.enthusiasm || '',
      career: member.career || '',
      avatar: member.avatar,
      isAdmin: member.isAdmin || false // 既存の値をセット
    });
    setMode('edit');
  };

  // アバターガチャ機能
  const refreshAvatar = () => {
    const randomId = Math.floor(Math.random() * 10000);
    setFormData({ ...formData, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomId}` });
  };

  const handleSave = async () => {
    if (!formData.name) return;
    
    try {
      setIsSubmitting(true);
      const dataToSave = {
        name: formData.name,
        role: formData.role,
        email: formData.email,
        department: formData.department,
        dream: formData.dream,
        enthusiasm: formData.enthusiasm,
        career: formData.career,
        avatar: formData.avatar, // アバターも更新！
        isAdmin: formData.isAdmin // 👈 これも保存！
      };

      if (mode === 'add') {
         // addMemberToFirestoreは引数が多いので、今回はupdateMember同様、裏側で作り直すか
         // ここでは既存関数を使うために簡易的に呼び出す（新項目はあとでUpdateする手もあるが、
         // 本来はadd関数を拡張すべき。今回は既存のadd関数を使いつつ、その後updateする「合わせ技」でいく！）
         
         // 1. 基本情報で作成
         const newId = await addMemberToFirestore(formData.name, formData.role, user?.uid || "", formData.email);
         // 2. 残りの詳細情報をUpdate
         await updateMemberInFirestore(newId, dataToSave);
      } else {
        await updateMemberInFirestore(formData.id, dataToSave);
      }
      
      setMode('view');
      window.location.reload();
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
      {/* 左側：メンバーリスト（そのまま） */}
      <div className="w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-700">メンバー</h2>
            <button onClick={() => setShowOnlyMyTeam(!showOnlyMyTeam)} className={`p-1.5 rounded-md transition-all ${showOnlyMyTeam ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-slate-200'}`} title="自分のチームのみ表示"><Filter size={16} /></button>
          </div>
          <button onClick={startAdd} className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors"><UserPlus size={20} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-2 space-y-2">
          {displayedMembers.map(member => (
            <button key={member.id} onClick={() => onSelectMember(member)} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all group ${selectedMember?.id === member.id ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200 shadow-sm' : 'hover:bg-slate-50 border border-transparent'}`}>
              <div className="relative">
                <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full bg-slate-200 object-cover" />
                {user && member.managerId === user.uid && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 truncate">
                  {member.name}
                  {/* 👇 管理者バッジを表示してあげると分かりやすい！ */}
                  {member.isAdmin && <ShieldCheck size={14} className="text-blue-500" />}
                </p>
                <p className="text-xs text-slate-500 truncate">{member.role}</p>
              </div>
              <div className="flex gap-1">
                <div onClick={(e) => startEdit(e, member)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all"><Pencil size={16} /></div>
                <div onClick={(e) => handleDeleteMember(e, member.id, member.name)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"><Trash2 size={16} /></div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 右側：詳細 or フォーム */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-y-auto">
        {mode !== 'view' ? (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              {mode === 'add' ? <UserPlus className="text-blue-500" /> : <Pencil className="text-blue-500" />}
              {mode === 'add' ? 'プロフィール作成' : 'プロフィール編集'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* アバター設定エリア */}
              <div className="col-span-full flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 mb-2">
                <img src={formData.avatar} alt="Avatar Preview" className="w-24 h-24 rounded-full bg-white shadow-sm object-cover mb-4" />
                <div className="flex gap-3">
                  <button type="button" onClick={refreshAvatar} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                    <RefreshCw size={16} /> ガチャで変更
                  </button>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="画像URLを直接入力"
                      value={formData.avatar}
                      onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                      className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm w-64 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Camera className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">※ 画像のURLを貼るか、ガチャボタンを押してください</p>
              </div>

              {/* 基本情報 */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-700 flex items-center gap-2 pb-2 border-b border-slate-100"><User size={18}/> 基本情報</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">名前</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">メールアドレス</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">部署・チーム</label>
                  <input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="例：開発部 アプリチーム" className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">役職</label>
                  <input type="text" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              {/* 👇 【重要】管理者権限チェックボックス */}
              <div className="pt-2">
                  <label className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={formData.isAdmin} 
                      onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" 
                    />
                    <div>
                      <p className="font-bold text-slate-700 text-sm flex items-center gap-1"><ShieldCheck size={16} /> 管理者権限を付与する</p>
                      <p className="text-xs text-slate-500">※ダッシュボードや全メンバーリストへのアクセスが可能になります。</p>
                    </div>
                  </label>
              </div>

              {/* 詳細情報 */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-700 flex items-center gap-2 pb-2 border-b border-slate-100"><Sparkles size={18}/> キャリア・ビジョン</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">将来の夢・目標</label>
                  <textarea value={formData.dream} onChange={(e) => setFormData({ ...formData, dream: e.target.value })} rows={2} placeholder="例：プロダクトマネージャーになって..." className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">今年度の意気込み</label>
                  <textarea value={formData.enthusiasm} onChange={(e) => setFormData({ ...formData, enthusiasm: e.target.value })} rows={2} placeholder="例：チームの生産性を2倍にする！" className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">過去の経歴</label>
                  <textarea value={formData.career} onChange={(e) => setFormData({ ...formData, career: e.target.value })} rows={3} placeholder="例：2020年 新卒入社 → 2022年 リーダー昇格..." className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setMode('view')} className="flex-1 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium">キャンセル</button>
              <button onClick={handleSave} disabled={isSubmitting} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex justify-center items-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin" /> : "保存する"}
              </button>
            </div>
          </div>
        ) : selectedMember ? (
          <>
            {/* 👇 ここが新しいプロフィールカード！ */}
            <div className="mb-8 bg-gradient-to-br from-white to-blue-50/50 rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
              
              <div className="flex items-start gap-6 relative z-10">
                <img src={selectedMember.avatar} alt={selectedMember.name} className="w-24 h-24 rounded-2xl shadow-md object-cover bg-white" />
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-800 mb-1">
                        {selectedMember.name}
                        {/* 👇 管理者の場合だけ、このバッジを表示！ */}
                        {selectedMember.isAdmin && (
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full border border-blue-200 font-bold flex items-center gap-1">
                            <ShieldCheck size={12}/> Admin
                          </span>
                        )}
                      </h2>
                      <div className="flex items-center gap-3 text-slate-600 mb-4">
                        <span className="flex items-center gap-1 text-sm bg-white px-2 py-1 rounded border border-slate-200"><Briefcase size={14}/> {selectedMember.role}</span>
                        {selectedMember.department && <span className="flex items-center gap-1 text-sm bg-white px-2 py-1 rounded border border-slate-200"><Building2 size={14}/> {selectedMember.department}</span>}
                      </div>
                    </div>
                    <button onClick={() => onCreateLog(selectedMember.id)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-200 font-bold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
                      <Plus size={20} /> 1on1記録
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    {selectedMember.dream && (
                      <div className="bg-white/80 p-3 rounded-lg border border-purple-100">
                        <p className="text-xs font-bold text-purple-600 mb-1 flex items-center gap-1"><Sparkles size={12}/> 将来の夢</p>
                        <p className="text-sm text-slate-700">{selectedMember.dream}</p>
                      </div>
                    )}
                    {selectedMember.enthusiasm && (
                      <div className="bg-white/80 p-3 rounded-lg border border-orange-100">
                        <p className="text-xs font-bold text-orange-600 mb-1 flex items-center gap-1"><Flag size={12}/> 今年度の意気込み</p>
                        <p className="text-sm text-slate-700">{selectedMember.enthusiasm}</p>
                      </div>
                    )}
                    {selectedMember.career && (
                      <div className="bg-white/80 p-3 rounded-lg border border-blue-100">
                        <p className="text-xs font-bold text-blue-600 mb-1 flex items-center gap-1"><ScrollText size={12}/> 経歴</p>
                        <p className="text-sm text-slate-700 line-clamp-3" title={selectedMember.career}>{selectedMember.career}</p>
                      </div>
                    )}
                  </div>
                  
                  {selectedMember.email && (
                     <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                        <Mail size={12}/> {selectedMember.email}
                     </div>
                  )}
                </div>
              </div>
            </div>

            {/* ログ一覧（デザインはそのまま） */}
            <div className="space-y-4">
               <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">🕒 1on1 履歴</h3>
               {memberLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">記録がありません</div>
               ) : (
                memberLogs.map(log => (
                  <div key={log.id} onClick={() => onSelectLog(log)} className="bg-white border border-slate-100 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-slate-500 font-medium flex items-center gap-2"><Cloud size={16}/> {log.date}</span>
                    </div>
                    {log.summary ? <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">{log.summary}</div> : <p className="text-slate-600 line-clamp-2">{log.good}</p>}
                  </div>
                ))
               )}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <User size={48} className="mb-4 text-slate-300" />
            <p>メンバーを選択してください</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberView;