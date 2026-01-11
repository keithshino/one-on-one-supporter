// src/components/AllHistory.tsx
import React, { useState } from 'react';
import { Log, Member } from '../types';
import { Search, ArrowLeft, Calendar, User, FileText, Filter } from 'lucide-react';

interface AllHistoryProps {
  logs: Log[];
  members: Member[];
  onBack: () => void;
  onSelectLog: (log: Log) => void;
}

export const AllHistory: React.FC<AllHistoryProps> = ({ logs, members, onBack, onSelectLog }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // 👇 修正1: 初期値を「今月」に設定（これで最初から絞り込まれて表示される！）
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // ログに紐づくメンバー情報を結合して、検索フィルターをかける
  const filteredLogs = logs.map(log => {
    const member = members.find(m => m.id === log.memberId);
    return { log, member };
  }).filter(({ log, member }) => {
    if (!member) return false;

    // 👇 修正2: 月フィルターのロジック追加
    // selectedMonth がある場合、その月と一致するかチェック（"2025-01" とかで判定）
    if (selectedMonth && !log.date.startsWith(selectedMonth)) {
        return false;
    }

    const searchLower = searchTerm.toLowerCase();
    return (
      member.name.toLowerCase().includes(searchLower) ||
      log.summary?.toLowerCase().includes(searchLower) ||
      log.good?.toLowerCase().includes(searchLower) ||
      log.more?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">全1on1履歴</h1>
          <p className="text-slate-500 text-sm">過去のすべての実施記録を確認できるとよ。</p>
        </div>
      </div>

      {/* 👇 修正3: フィルターエリア（月選択 & キーワード検索） */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 sticky top-0 z-10 space-y-3 md:space-y-0 md:flex md:items-center md:gap-4">
        
        {/* 月選択ピッカー */}
        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 text-slate-400" size={20} />
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 w-full md:w-auto font-bold bg-slate-50 hover:bg-white transition-colors cursor-pointer"
          />
        </div>

        {/* 検索バー */}
        <div className="flex-1 flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all bg-slate-50 focus-within:bg-white">
          <Search className="text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="メンバー名、ログの内容で検索..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
          />
        </div>
      </div>

      {/* ログリスト */}
      <div className="space-y-4">
        {filteredLogs.length > 0 ? (
          filteredLogs.map(({ log, member }) => (
            <div 
              key={log.id}
              onClick={() => onSelectLog(log)}
              className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={member?.avatar} 
                    alt={member?.name} 
                    className="w-10 h-10 rounded-full border border-slate-100" 
                  />
                  <div>
                    <h3 className="font-bold text-slate-800">{member?.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar size={12} /> {log.date}
                    </p>
                  </div>
                </div>
                <div className="text-2xl" title={`Mood: ${log.mood}`}>
                  {log.mood === 'sunny' && '☀️'}
                  {log.mood === 'cloudy' && '☁️'}
                  {log.mood === 'rainy' && '🌧️'}
                  {log.mood === 'stormy' && '⚡'}
                  {!log.mood && '📝'}
                </div>
              </div>

              {log.summary ? (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-600 line-clamp-2">
                  <span className="font-bold text-slate-400 mr-2 text-xs">AI要約</span>
                  {log.summary}
                </div>
              ) : (
                <div className="text-sm text-slate-400 italic flex items-center gap-1">
                  <FileText size={14} /> 詳細を確認するにはクリック
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Filter size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="font-medium">条件に一致するログが見つかりませんでした...</p>
            <p className="text-sm mt-1">月や検索ワードを変更してみてください。</p>
          </div>
        )}
      </div>
    </div>
  );
};