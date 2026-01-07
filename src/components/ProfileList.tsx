// src/components/ProfileList.tsx
import React, { useState } from 'react';
import { Member } from '../types';
import { Search, Briefcase, Building2, Calendar, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileListProps {
  members: Member[];
  onSelectMember: (member: Member) => void;
}

// 👇 修正1: ProfileCard専用の型を作る
interface ProfileCardProps {
  member: Member;
  isMe?: boolean;
  onClick: () => void;
}

// 👇 修正2: React.FC<ProfileCardProps> を使って「コンポーネントだよ」と宣言する
// これで key エラーは消えるはずたい！
const ProfileCard: React.FC<ProfileCardProps> = ({ member, isMe = false, onClick }) => (
  <div 
    onClick={onClick}
    className={`relative p-6 rounded-2xl border transition-all cursor-pointer group hover:shadow-md ${
      isMe 
        ? 'bg-gradient-to-br from-blue-50 to-white border-blue-200 shadow-sm' 
        : 'bg-white border-slate-200 hover:border-blue-300'
    }`}
  >
    {isMe && (
      <span className="absolute top-4 right-4 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
        You
      </span>
    )}
    
    <div className="flex items-center gap-4">
      <img 
        src={member.avatar} 
        alt={member.name} 
        className={`rounded-full object-cover border-2 ${isMe ? 'w-20 h-20 border-blue-200' : 'w-16 h-16 border-slate-100'}`} 
      />
      <div className="overflow-hidden">
        <h3 className={`font-bold truncate ${isMe ? 'text-xl text-blue-900' : 'text-lg text-slate-800'}`}>
          {member.name}
        </h3>
        <div className="text-sm text-slate-500 space-y-1 mt-1">
          <p className="flex items-center gap-1.5 truncate">
            <Building2 size={14} /> {member.department || '部署未設定'}
          </p>
          <p className="flex items-center gap-1.5 truncate">
            <Briefcase size={14} /> {member.role || '役職なし'}
          </p>
          {member.joinDate && (
            <p className="flex items-center gap-1.5 truncate text-slate-400 text-xs">
              <Calendar size={12} /> {member.joinDate} 入社
            </p>
          )}
        </div>
      </div>
    </div>
    
    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-blue-600 flex items-center gap-1">
      プロフィールを見る &gt;
    </div>
  </div>
);

export const ProfileList: React.FC<ProfileListProps> = ({ members, onSelectMember }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const currentUser = members.find(m => m.email === user?.email);

  const otherMembers = members.filter(m => 
    m.id !== currentUser?.id && 
    (
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.role?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">プロフィール一覧</h1>
        <p className="text-slate-500">メンバーの人となりを知って、コミュニケーションを深めましょう。</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-8 flex items-center gap-2 sticky top-0 z-10">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="名前、部署、役職で検索..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 outline-none text-slate-700 placeholder:text-slate-400"
        />
      </div>

      <div className="space-y-8">
        {currentUser && (
          <section>
            <h2 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">
              <User size={16} /> あなたのプロフィール
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <ProfileCard member={currentUser} isMe={true} onClick={() => onSelectMember(currentUser)} />
            </div>
          </section>
        )}

        <section>
          <h2 className="text-sm font-bold text-slate-400 mb-3">メンバー ({otherMembers.length}名)</h2>
          {otherMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherMembers.map(member => (
                // これで key エラーは解消されるはず！
                <ProfileCard key={member.id} member={member} onClick={() => onSelectMember(member)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
              該当するメンバーが見つかりませんでした...
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
