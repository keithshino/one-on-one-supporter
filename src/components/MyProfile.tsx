// src/components/MyProfile.tsx
import React, { useState, useEffect } from 'react';
import { Member } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { updateMemberInFirestore } from '../lib/firestore';
import { User, Briefcase, Mail, Sparkles, Building2, Flag, ScrollText, RefreshCw, Camera, Calendar, Save, Loader2 } from 'lucide-react';

interface MyProfileProps {
  members: Member[];
}

const MyProfile: React.FC<MyProfileProps> = ({ members }) => {
  const { user } = useAuth();
  
  // 自分のデータを特定
  const myMemberProfile = members.find(m => m.email === user?.email);

  // フォームの状態
  const [formData, setFormData] = useState<Member | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // データ読み込み時にフォームにセット
  useEffect(() => {
    if (myMemberProfile) {
      setFormData({ ...myMemberProfile });
    }
  }, [myMemberProfile]);

  // アバターガチャ
  const refreshAvatar = () => {
    if (!formData) return;
    const randomId = Math.floor(Math.random() * 10000);
    setFormData({ ...formData, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomId}` });
  };

  const handleSave = async () => {
    if (!formData || !myMemberProfile) return;
    
    try {
      setIsSubmitting(true);
      await updateMemberInFirestore(myMemberProfile.id, {
        name: formData.name,
        role: formData.role,
        department: formData.department,
        dream: formData.dream,
        enthusiasm: formData.enthusiasm,
        career: formData.career,
        avatar: formData.avatar,
        joinDate: formData.joinDate // 👈 入社年月も保存！
      });
      
      // 👇 【修正】リロードをやめて、完了メッセージを出す
      alert("プロフィールを更新しました！✨"); 
      setIsEditing(false);
      // window.location.reload(); // 👈 削除（Firestoreが自動で画面更新してくれるから不要！）
    } catch (error) {
      alert("保存に失敗した...");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  if (!myMemberProfile) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <div className="bg-yellow-50 text-yellow-800 p-8 rounded-xl border border-yellow-200">
          <User size={48} className="mx-auto mb-4 opacity-50"/>
          <h2 className="text-xl font-bold mb-2">メンバー登録が見つかりません</h2>
          <p>あなたのメールアドレス ({user.email}) と紐づくメンバー情報がありません。<br/>マネージャーに登録を依頼してください。</p>
        </div>
      </div>
    );
  }

  if (!formData) return <div>Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">マイプロフィール</h1>
          <p className="text-slate-500 mt-1">あなたの情報を管理します。</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-colors"
          >
            編集する
          </button>
        )}
      </div>

      {isEditing ? (
        // ✏️ 編集モード
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* アバター設定 */}
              <div className="col-span-full flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <img src={formData.avatar} alt="Avatar" className="w-24 h-24 rounded-full bg-white shadow-sm object-cover mb-4" />
                <div className="flex gap-3">
                  <button onClick={refreshAvatar} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
                    <RefreshCw size={16} /> ガチャ
                  </button>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={formData.avatar}
                      onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                      className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm w-64 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="画像URL"
                    />
                    <Camera className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  </div>
                </div>
              </div>

              {/* 基本情報 */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-700 border-b pb-2">基本情報</h3>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">名前</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">役職</label>
                  <input type="text" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500 block mb-1">部署</label>
                   <input type="text" value={formData.department || ''} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500 block mb-1">入社年月</label>
                   <div className="relative">
                     <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
                     <input 
                       type="month" 
                       value={formData.joinDate || ''} 
                       onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })} 
                       className="w-full pl-10 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                     />
                   </div>
                </div>
              </div>

              {/* 詳細情報 */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-700 border-b pb-2">キャリア・ビジョン</h3>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">将来の夢</label>
                  <textarea value={formData.dream || ''} onChange={(e) => setFormData({ ...formData, dream: e.target.value })} className="w-full p-2 border rounded-lg h-20" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">今年度の意気込み</label>
                  <textarea value={formData.enthusiasm || ''} onChange={(e) => setFormData({ ...formData, enthusiasm: e.target.value })} className="w-full p-2 border rounded-lg h-20" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">経歴</label>
                  <textarea value={formData.career || ''} onChange={(e) => setFormData({ ...formData, career: e.target.value })} className="w-full p-2 border rounded-lg h-24" />
                </div>
              </div>
           </div>

           <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
             <button onClick={() => setIsEditing(false)} className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">キャンセル</button>
             <button onClick={handleSave} disabled={isSubmitting} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-700 flex items-center gap-2">
               {isSubmitting ? <Loader2 className="animate-spin"/> : <><Save size={18}/> 保存する</>}
             </button>
           </div>
        </div>
      ) : (
        // 👀 表示モード（プロフィールカード）
        <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-3xl p-8 border border-slate-100 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
            
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
              <img src={formData.avatar} alt={formData.name} className="w-32 h-32 rounded-3xl shadow-lg object-cover bg-white" />
              
              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <h2 className="text-4xl font-bold text-slate-800 mb-2">{formData.name}</h2>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 text-slate-600">
                    <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-slate-200 text-sm font-medium"><Briefcase size={14}/> {formData.role}</span>
                    {formData.department && <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-slate-200 text-sm font-medium"><Building2 size={14}/> {formData.department}</span>}
                    {formData.joinDate && <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-slate-200 text-sm font-medium text-blue-600"><Calendar size={14}/> {formData.joinDate} 入社</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    {formData.dream && (
                      <div className="bg-white/80 p-4 rounded-xl border border-purple-100 shadow-sm">
                        <p className="text-xs font-bold text-purple-600 mb-1 flex items-center gap-1"><Sparkles size={12}/> 将来の夢</p>
                        <p className="text-slate-700">{formData.dream}</p>
                      </div>
                    )}
                    {formData.enthusiasm && (
                      <div className="bg-white/80 p-4 rounded-xl border border-orange-100 shadow-sm">
                        <p className="text-xs font-bold text-orange-600 mb-1 flex items-center gap-1"><Flag size={12}/> 今年度の意気込み</p>
                        <p className="text-slate-700">{formData.enthusiasm}</p>
                      </div>
                    )}
                    {formData.career && (
                      <div className="bg-white/80 p-4 rounded-xl border border-blue-100 shadow-sm">
                        <p className="text-xs font-bold text-blue-600 mb-1 flex items-center gap-1"><ScrollText size={12}/> 経歴</p>
                        <p className="text-slate-700 text-sm whitespace-pre-wrap">{formData.career}</p>
                      </div>
                    )}
                </div>
                
                <div className="pt-4 flex items-center justify-center md:justify-start gap-2 text-sm text-slate-400">
                  <Mail size={14}/> {formData.email}
                </div>
              </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;