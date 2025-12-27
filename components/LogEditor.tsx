
import React, { useState, useEffect } from 'react';
import { Log, Member, Mood } from '../types';
import { generateLogSummary } from '../geminiService';

interface LogEditorProps {
  log: Log | null;
  member: Member;
  onSave: (log: Log) => void;
  onCancel: () => void;
}

const LogEditor: React.FC<LogEditorProps> = ({ log, member, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Log>({
    id: log?.id || `l-${Date.now()}`,
    memberId: member.id,
    date: log?.date || new Date().toISOString(),
    mood: log?.mood || 'sunny',
    good: log?.good || '',
    more: log?.more || '',
    nextAction: log?.nextAction || '',
    memo: log?.memo || '',
    summary: log?.summary || '',
    isPlanned: log?.isPlanned ?? false,
  });

  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (log) setFormData(log);
  }, [log]);

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    const summary = await generateLogSummary(formData.memo, formData.good, formData.more, formData.nextAction);
    setFormData(prev => ({ ...prev, summary }));
    setIsGenerating(false);
  };

  const handleSave = () => {
    onSave({ ...formData, isPlanned: false });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">1on1 ログ作成</h2>
            <p className="text-slate-500">{member.name} とのセッション記録</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="px-6 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors border border-transparent">
            キャンセル
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all active:scale-95"
          >
            ログを保存
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Basic Info Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">日時</label>
              <input 
                type="datetime-local" 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.date.slice(0, 16)}
                onChange={e => setFormData({ ...formData, date: new Date(e.target.value).toISOString() })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">今日のムード</label>
              <div className="grid grid-cols-4 gap-2">
                {(['sunny', 'cloudy', 'rainy', 'stormy'] as Mood[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setFormData({ ...formData, mood: m })}
                    className={`p-3 text-2xl rounded-xl border-2 transition-all ${
                      formData.mood === m ? 'bg-indigo-50 border-indigo-500 scale-110 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {m === 'sunny' && '☀️'}
                    {m === 'cloudy' && '☁️'}
                    {m === 'rainy' && '🌧️'}
                    {m === 'stormy' && '⚡'}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <span className="bg-amber-400 w-1.5 h-4 rounded-full"></span>
                AI要約サマリー
              </label>
              <div className="relative">
                <textarea
                  className="w-full bg-indigo-50/30 border border-indigo-100 rounded-xl p-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px] leading-relaxed"
                  placeholder="要約を生成するか直接入力してください..."
                  value={formData.summary}
                  onChange={e => setFormData({ ...formData, summary: e.target.value })}
                />
                <button
                  onClick={handleGenerateSummary}
                  disabled={isGenerating}
                  className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-bold py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
                >
                  {isGenerating ? '生成中...' : '🪄 AIで要約を生成'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Structured Content Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-emerald-600 uppercase tracking-wider">👍 Good / 良かったこと</label>
                <textarea
                  className="w-full border border-slate-100 bg-slate-50/50 rounded-xl p-4 text-sm focus:bg-white focus:border-emerald-300 outline-none transition-all min-h-[100px]"
                  placeholder="達成したタスク、成長した点など"
                  value={formData.good}
                  onChange={e => setFormData({ ...formData, good: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-rose-500 uppercase tracking-wider">💪 More / 改善・課題</label>
                <textarea
                  className="w-full border border-slate-100 bg-slate-50/50 rounded-xl p-4 text-sm focus:bg-white focus:border-rose-300 outline-none transition-all min-h-[100px]"
                  placeholder="不安な点、困っていること、改善したい点など"
                  value={formData.more}
                  onChange={e => setFormData({ ...formData, more: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-indigo-600 uppercase tracking-wider">🚀 Next Action / 次のアクション</label>
              <textarea
                className="w-full border border-slate-100 bg-slate-50/50 rounded-xl p-4 text-sm focus:bg-white focus:border-indigo-300 outline-none transition-all min-h-[80px]"
                placeholder="次回までにやるべき具体的なステップ"
                value={formData.nextAction}
                onChange={e => setFormData({ ...formData, nextAction: e.target.value })}
              />
            </div>

            <div className="pt-6 border-t border-slate-100">
              <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                マネージャー用個人メモ
              </label>
              <textarea
                className="w-full border border-slate-200 rounded-xl p-5 text-sm focus:border-slate-400 outline-none transition-all min-h-[200px]"
                placeholder="会話のログ、気づき、ケアすべき点などを自由にメモしてください。"
                value={formData.memo}
                onChange={e => setFormData({ ...formData, memo: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogEditor;
