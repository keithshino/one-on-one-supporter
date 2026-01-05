// src/components/LogEditor.tsx
import React, { useState } from 'react';
import { Save, X, Calendar, Smile, Cloud, Sun, CloudRain, Loader2, Sparkles } from 'lucide-react';
import { Member, Log } from '../types';
import { addLogToFirestore } from '../lib/firestore';
import { generateSummary } from '../geminiService'; // 👈 AI係を呼ぶ！

interface LogEditorProps {
  log: Log | null;
  member: Member;
  onSave: (newLog: Log) => void; 
  onCancel: () => void;
}

export const LogEditor: React.FC<LogEditorProps> = ({ log, member, onSave, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingText, setLoadingText] = useState(""); // ロード中の文字を変える用
  
  const [formData, setFormData] = useState({
    date: (log?.date || new Date().toISOString()).split('T')[0],
    mood: log?.mood || 'sunny',
    good: log?.good || '',
    more: log?.more || '',
    nextAction: log?.nextAction || '',
    memo: log?.memo || '',
  });

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      setLoadingText("AIが要約中..."); // ユーザーに状況を伝える

      // 1. まずGeminiに要約してもらう！
      const aiSummary = await generateSummary(
        formData.good,
        formData.more,
        formData.nextAction,
        formData.memo
      );

      setLoadingText("保存中...");

      // 2. 要約付きでFirestoreに保存
      const newDocId = await addLogToFirestore(member.id, {
        date: formData.date,
        mood: formData.mood as 'sunny' | 'cloudy' | 'rainy' | 'stormy',
        good: formData.good,
        more: formData.more,
        nextAction: formData.nextAction,
        memo: formData.memo,
        summary: aiSummary, // 👈 ここにAIの成果が入る！
        isPlanned: false,
      });

      // 3. 親コンポーネントに渡すデータを作る
      const newLogData: Log = {
        id: newDocId,
        memberId: member.id,
        date: formData.date,
        mood: formData.mood as any,
        good: formData.good,
        more: formData.more,
        nextAction: formData.nextAction,
        memo: formData.memo,
        summary: aiSummary, // 👈 こっちにも入れる！
        isPlanned: false,
      };

      onSave(newLogData);

    } catch (error) {
      console.error("保存失敗:", error);
      alert("保存に失敗しました。もう一度試してください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
      {/* ヘッダー */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            📝 {member.name} との1on1
          </h2>
          <p className="text-sm text-slate-500">AIが自動で要約を作成します✨</p>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* 入力フォーム */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Calendar size={16} /> 日付
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Smile size={16} /> 今日のムード
            </label>
            <div className="flex gap-2">
              {[
                { value: 'sunny', icon: Sun, color: 'text-orange-500', bg: 'bg-orange-50' },
                { value: 'cloudy', icon: Cloud, color: 'text-gray-500', bg: 'bg-gray-50' },
                { value: 'rainy', icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-50' },
                { value: 'stormy', icon: CloudRain, color: 'text-purple-500', bg: 'bg-purple-50' },
              ].map((m) => (
                <button
                  key={m.value}
                  onClick={() => setFormData({ ...formData, mood: m.value as any })}
                  className={`flex-1 p-3 rounded-lg border flex justify-center items-center transition-all ${
                    formData.mood === m.value
                      ? `${m.bg} ${m.color} border-current ring-1 ring-current`
                      : 'border-slate-100 text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <m.icon size={24} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 text-green-600">Good (良かったこと)</label>
            <textarea
              value={formData.good}
              onChange={(e) => setFormData({ ...formData, good: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="進捗があったこと、感謝したいこと..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 text-blue-600">More (課題・悩み)</label>
            <textarea
              value={formData.more}
              onChange={(e) => setFormData({ ...formData, more: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="困っていること、相談したいこと..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 text-purple-600">Next Action (次やること)</label>
            <textarea
              value={formData.nextAction}
              onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg h-20 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="具体的なアクションと期限..."
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 text-gray-600">Memo (その他)</label>
            <textarea
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg h-20 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="雑談、共有事項など..."
            />
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end gap-3">
        <button onClick={onCancel} disabled={isSubmitting} className="px-6 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-medium disabled:opacity-50">キャンセル</button>
        <button onClick={handleSave} disabled={isSubmitting} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50">
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="animate-spin" /> {loadingText}
            </>
          ) : (
            <>
              <Sparkles size={20} /> 保存＆AI要約
            </>
          )}
        </button>
      </div>
    </div>
  );
};