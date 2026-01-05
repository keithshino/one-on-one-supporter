// src/components/LogEditor.tsx
import React, { useState, useEffect } from 'react';
import { Member, Log, Mood } from '../types';
import { ArrowLeft, Save, Sparkles, Loader2, Calendar, Sun, Cloud, CloudRain, Zap } from 'lucide-react';
import { addLogToFirestore, updateMemberInFirestore, updateLogInFirestore } from '../lib/firestore';
import { generateSummary } from '../lib/geminiService';

interface LogEditorProps {
  member: Member;
  initialLog?: Log | null;
  onBack: () => void;
  onSave: () => void;
}

export const LogEditor: React.FC<LogEditorProps> = ({ member, initialLog, onBack, onSave }) => {
  const [formData, setFormData] = useState({
    date: initialLog ? initialLog.date : new Date().toISOString().split('T')[0],
    good: initialLog ? initialLog.good : '',
    more: initialLog ? initialLog.more : '',
    nextAction: initialLog ? initialLog.nextAction : '',
    summary: initialLog ? initialLog.summary || '' : '',
    nextMeetingDate: '',
    mood: (initialLog?.mood || 'sunny') as Mood // 👇 ムードの初期値
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialLog) {
      setFormData(prev => ({
        ...prev,
        date: initialLog.date,
        good: initialLog.good,
        more: initialLog.more,
        nextAction: initialLog.nextAction,
        summary: initialLog.summary || '',
        mood: initialLog.mood || 'sunny'
      }));
    }
  }, [initialLog]);

  const handleGenerateSummary = async () => {
    if (!formData.good && !formData.more) {
      alert("「Good」または「More」を入力してからボタンを押してね！");
      return;
    }

    setIsGenerating(true);
    try {
      const content = `Good: ${formData.good}\nMore: ${formData.more}\nNext Action: ${formData.nextAction}`;
      const summary = await generateSummary(content);
      setFormData(prev => ({ ...prev, summary }));
    } catch (error) {
      console.error(error);
      alert("AI要約に失敗した...");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!formData.good && !formData.more) return;

    try {
      setIsSaving(true);
      
      const logData = {
        date: formData.date,
        good: formData.good,
        more: formData.more,
        nextAction: formData.nextAction,
        summary: formData.summary,
        mood: formData.mood // 👈 ムードも保存！
      };

      if (initialLog) {
        await updateLogInFirestore(initialLog.id, logData);
      } else {
        await addLogToFirestore({
          ...logData,
          memberId: member.id,
          isPlanned: false,
        });

        if (formData.nextMeetingDate) {
          await updateMemberInFirestore(member.id, {
            nextMeetingDate: formData.nextMeetingDate
          });
        }
      }

      onSave();
    } catch (error) {
      console.error(error);
      alert("保存に失敗した...");
    } finally {
      setIsSaving(false);
    }
  };

  // ムード選択ボタンのコンポーネント（内部定義）
  const MoodButton = ({ type, icon: Icon, label, color }: { type: Mood, icon: any, label: string, color: string }) => (
    <button
      onClick={() => setFormData({ ...formData, mood: type })}
      className={`flex-1 p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${
        formData.mood === type 
          ? `bg-${color}-50 border-${color}-500 text-${color}-600 ring-1 ring-${color}-500 shadow-sm` 
          : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
      }`}
    >
      <Icon size={24} className={formData.mood === type ? 'scale-110 transition-transform' : ''} />
      <span className="text-xs font-bold">{label}</span>
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          戻る
        </button>
        <div className="flex items-center gap-3">
          <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full border border-slate-200" />
          <span className="font-bold text-slate-700">
            {initialLog ? `${member.name} さんのログ編集` : `${member.name} さんのログ記録`}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">実施日</label>
                <input 
                  type="date" 
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                />
              </div>

              {/* 👇 新登場！ムード選択エリア */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">今回の雰囲気 (Mood)</label>
                <div className="flex gap-3">
                  <MoodButton type="sunny" icon={Sun} label="晴れ" color="orange" />
                  <MoodButton type="cloudy" icon={Cloud} label="曇り" color="slate" />
                  <MoodButton type="rainy" icon={CloudRain} label="雨" color="blue" />
                  <MoodButton type="stormy" icon={Zap} label="嵐" color="purple" />
                </div>
              </div>
            </div>
            
            {!initialLog && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Calendar size={16} className="text-blue-500"/> 次回の予定 (任意)
                </label>
                <input 
                  type="date" 
                  value={formData.nextMeetingDate}
                  onChange={(e) => setFormData({ ...formData, nextMeetingDate: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow bg-blue-50/50 border-blue-100 text-blue-900"
                />
                <p className="text-xs text-slate-400 mt-1 ml-1">※ 入力するとダッシュボード等に反映されます</p>
              </div>
            )}
          </div>

          {/* Good / More / Next Action エリア */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-green-700 mb-2">Good (良かったこと)</label>
              <textarea 
                value={formData.good}
                onChange={(e) => setFormData({ ...formData, good: e.target.value })}
                className="w-full h-32 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-blue-700 mb-2">More (課題・改善点)</label>
              <textarea 
                value={formData.more}
                onChange={(e) => setFormData({ ...formData, more: e.target.value })}
                className="w-full h-32 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-shadow"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-purple-700 mb-2">Next Action (次やること)</label>
            <textarea 
              value={formData.nextAction}
              onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
              className="w-full h-24 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none transition-shadow"
            />
          </div>

          {/* AI要約エリア */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center gap-2 font-bold text-slate-700">
                <Sparkles size={18} className="text-yellow-500" />
                AI要約
              </label>
              <button 
                onClick={handleGenerateSummary}
                disabled={isGenerating || (!formData.good && !formData.more)}
                className="text-sm px-5 py-2 rounded-lg font-bold text-white bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 shadow-md hover:shadow-lg transform transition-all hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                {isGenerating ? <Loader2 size={16} className="animate-spin text-white" /> : <Sparkles size={16} className="text-white" />}
                AIで要約を生成
              </button>
            </div>
            <textarea 
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full h-24 p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none resize-none transition-shadow text-sm leading-relaxed"
              placeholder="AIボタンを押すと、ここに要約が生成されます..."
            />
          </div>

        </div>
      </div>

      <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-4">
         <button 
          onClick={onBack}
          className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
        >
          キャンセル
        </button>
        <button 
          onClick={handleSave}
          disabled={isSaving || (!formData.good && !formData.more)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none"
        >
          {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> {initialLog ? '更新する' : '保存する'}</>}
        </button>
      </div>
    </div>
  );
};