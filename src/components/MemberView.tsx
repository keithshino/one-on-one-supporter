// src/components/MemberView.tsx
import React, { useState } from 'react';
import { Member, Log } from '../types';
import { Search, Plus, MoreVertical, Edit2, Trash2, X, Save, User, UserCheck, Shield, ShieldAlert } from 'lucide-react'; // UserCheckアイコン追加
import { addMemberToFirestore, updateMemberInFirestore, deleteMemberFromFirestore } from '../lib/firestore';

interface MemberViewProps {
  members: Member[];
  logs: Log[];
  memberId: string | null;
  onSelectMember: (member: Member) => void;
  onSelectLog: (log: Log) => void;
  onCreateLog: (memberId: string) => void;
  isAdmin: boolean; // 👈 受け取る設定を追加
  // 👇 追加
  viewScope: 'all' | 'team';
  onToggleScope: (scope: 'all' | 'team') => void;
}

export const MemberView: React.FC<MemberViewProps> = ({ 
  members, 
  logs, 
  memberId, 
  onSelectMember, 
  onSelectLog,
  onCreateLog,
  isAdmin,
  viewScope, 
  onToggleScope // 👈 受け取る 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // フォーム用データ
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    avatar: '',
    managerId: '',
    isAdmin: false // 👈 フォームにも追加
  });

  // 検索フィルター
  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 新規作成・編集モーダルを開く
  const openModal = (member?: Member) => {

    // ⚠️ 管理者じゃないのに開こうとしたらブロック（念のため）
    if (!isAdmin && !member) return;

    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        email: member.email,
        role: member.role || '',
        department: member.department || '',
        avatar: member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
        managerId: member.managerId || '',
        isAdmin: member.isAdmin || false // 既存の値をセット
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: '',
        email: '',
        role: '',
        department: '',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
        managerId: '',
        isAdmin: false
      });
    }
    setIsModalOpen(true);
  };

  // 保存処理
  const handleSave = async () => {
    if (!formData.name) return alert('名前は必須です');

    try {
      if (editingMember) {
        // 更新
        await updateMemberInFirestore(editingMember.id, formData);
      } else {
        // 新規作成
        await addMemberToFirestore(formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      alert('保存に失敗しました');
    }
  };

  // 削除処理
  const handleDelete = async (id: string) => {
    if (window.confirm('本当に削除しますか？この操作は取り消せません。')) {
      try {
        await deleteMemberFromFirestore(id);
        if (memberId === id) {
          // 選択中のメンバーを削除した場合の処理（必要なら親に通知など）
        }
      } catch (error) {
        console.error(error);
        alert('削除に失敗しました');
      }
    }
  };

  // 上司の名前を取得するヘルパー関数
  const getManagerName = (managerId: string) => {
    const manager = members.find(m => m.id === managerId);
    return manager ? manager.name : '未設定';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">メンバーリスト</h1>
          <p className="text-slate-500">チームメンバーの管理と編集を行います。</p>
        </div>
        
        <div className="flex gap-4 items-center">
          {/* 👇 ここ！管理者(Admin)の時だけ表示する切り替えスイッチを追加！ */}
          {isAdmin && (
            <div className="bg-white border border-slate-200 p-1 rounded-lg flex text-sm font-bold shadow-sm">
              <button
                onClick={() => onToggleScope('all')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  viewScope === 'all' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                全社
              </button>
              <button
                onClick={() => onToggleScope('team')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  viewScope === 'team' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                自チーム
              </button>
            </div>
          )}

          {/* メンバー追加ボタン（管理者の時だけ） */}
          {isAdmin && (
            <button 
              onClick={() => openModal()}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={20} /> 追加
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex items-center gap-2">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="名前や部署で検索..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 outline-none text-slate-700 placeholder:text-slate-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map(member => (
          <div key={member.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative">
            
            {isAdmin && (
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); openModal(member); }}
                  className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(member.id); }}
                  className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}

            <div className="flex items-center gap-4 mb-4 cursor-pointer" onClick={() => onSelectMember(member)}>
              <div className="relative">
                <img src={member.avatar} alt={member.name} className="w-14 h-14 rounded-full bg-slate-100 border border-slate-100" />
                {member.isAdmin && (
                  <div className="absolute -top-1 -right-1 bg-yellow-400 text-white p-1 rounded-full border-2 border-white" title="管理者">
                    <Shield size={10} fill="currentColor" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  {member.name}
                </h3>
                <p className="text-sm text-slate-500 font-medium">{member.department || '部署未設定'}</p>
                <p className="text-xs text-slate-400 mt-0.5">{member.role}</p> 
              </div>
            </div>

            <div className="border-t border-slate-50 pt-3 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <UserCheck size={14} className="text-slate-400"/>
                上司: <span className="font-medium text-slate-700">{getManagerName(member.managerId || '')}</span>
              </div>
              <button 
                onClick={() => onCreateLog(member.id)}
                className="text-blue-600 font-bold hover:underline"
              >
                ログ記録
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-xl text-slate-800">
                {editingMember ? 'メンバー編集' : '新規メンバー追加'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">お名前 <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="例：山田 太郎"
                />
              </div>

              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={formData.isAdmin}
                    onChange={(e) => setFormData({...formData, isAdmin: e.target.checked})}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="block font-bold text-slate-800 flex items-center gap-2">
                      <ShieldAlert size={16} className="text-yellow-600"/>
                      管理者権限 (Admin) を付与する
                    </span>
                    <span className="text-xs text-slate-500">
                      ONにすると、全メンバーの閲覧・編集・削除が可能になります。
                    </span>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">部署</label>
                  <input 
                    type="text" 
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="例：開発部"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">役職</label>
                  <input 
                    type="text" 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="例：リーダー"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
                  <UserCheck size={16} className="text-blue-500"/> 上司 (マネージャー)
                </label>
                <select
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">(上司なし)</option>
                  {members
                    .filter(m => m.id !== editingMember?.id)
                    .map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.department ? `(${m.department})` : ''}
                      </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">メールアドレス</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="email@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">アイコン画像URL</label>
                <div className="flex gap-2">
                  <img src={formData.avatar} className="w-10 h-10 rounded-full border bg-slate-50" />
                  <input 
                    type="text" 
                    value={formData.avatar}
                    onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                    className="flex-1 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
              >
                キャンセル
              </button>
              <button 
                onClick={handleSave}
                className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2"
              >
                <Save size={18} /> 保存する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
