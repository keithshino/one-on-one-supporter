
import React from 'react';
import { Log } from '../types';

interface CalendarProps {
  logs: Log[];
}

const Calendar: React.FC<CalendarProps> = ({ logs }) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth }, (_, i) => null);

  const getLogForDay = (day: number) => {
    return logs.filter(log => {
      const logDate = new Date(log.date);
      return logDate.getDate() === day && logDate.getMonth() === month && logDate.getFullYear() === year;
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-slate-800">{year}年 {month + 1}月</h3>
        <div className="flex gap-2">
          <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-slate-400 mb-2">
        {['日', '月', '火', '水', '木', '金', '土'].map(d => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {padding.map((_, i) => <div key={`pad-${i}`} className="aspect-square"></div>)}
        {days.map(day => {
          const dayLogs = getLogForDay(day);
          const isToday = day === today.getDate();
          return (
            <div
              key={day}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg relative ${
                isToday ? 'bg-indigo-50 text-indigo-600 font-bold' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span>{day}</span>
              {dayLogs.length > 0 && (
                <div className="flex gap-0.5 mt-1">
                  {dayLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={`w-1 h-1 rounded-full ${log.isPlanned ? 'bg-indigo-400' : 'bg-emerald-400'}`}
                    ></div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-100 flex gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          完了済み
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
          予定
        </div>
      </div>
    </div>
  );
};

export default Calendar;
