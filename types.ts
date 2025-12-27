
export type Mood = 'sunny' | 'cloudy' | 'rainy' | 'stormy';

export interface Member {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface Log {
  id: string;
  memberId: string;
  date: string; // ISO string
  mood: Mood;
  good: string;
  more: string;
  nextAction: string;
  memo: string;
  summary: string;
  isPlanned: boolean;
}

export type View = 'dashboard' | 'members' | 'editor';

export interface AppState {
  view: View;
  selectedMemberId: string | null;
  editingLogId: string | null;
}
