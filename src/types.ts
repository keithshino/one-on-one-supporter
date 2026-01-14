
export type Mood = 'sunny' | 'cloudy' | 'rainy' | 'stormy';

export interface Member {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email?: string;      // 将来の招待機能用（?は「なくてもOK」の意味）
  managerId?: string;  // 「誰の部下か」を紐づける用
  // 👇 【追加】プロフィール用の新項目
  department?: string;  // 所属部署
  dream?: string;       // 将来の夢
  enthusiasm?: string;  // 今年度の意気込み
  career?: string;      // 過去の経歴
  joinDate?: string;    // 入社日
  isAdmin?: boolean;   // 管理者権限
  nextMeetingDate?: string; // 次回の1on1日程
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
  physicalCondition?: number; // フィジカルコンディション (1-5)
  mentalCondition?: number; // メンタルコンディション (1-5)
  weather?: string; // お天気
}

export type View = 'dashboard' | 'members' | 'editor' | 'my-history' | 'profile' | 'member-detail' | 'profile-list' | 'all-history';

export interface AppState {
  view: View;
  selectedMemberId: string | null;
  editingLogId: string | null;
}
