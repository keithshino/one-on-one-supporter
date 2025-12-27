
import { Member, Log } from './types';

export const MOCK_MEMBERS: Member[] = [
  { id: '1', name: '田中 健太', role: 'Frontend Engineer', avatar: 'https://picsum.photos/seed/kenta/200' },
  { id: '2', name: '佐藤 美咲', role: 'Product Designer', avatar: 'https://picsum.photos/seed/misaki/200' },
  { id: '3', name: '鈴木 拓海', role: 'Backend Engineer', avatar: 'https://picsum.photos/seed/takumi/200' },
  { id: '4', name: '高橋 結衣', role: 'QA Engineer', avatar: 'https://picsum.photos/seed/yui/200' },
];

const now = new Date();
const pastDate = (days: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return d.toISOString();
};
const futureDate = (days: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

export const MOCK_LOGS: Log[] = [
  {
    id: 'l1',
    memberId: '1',
    date: pastDate(7),
    mood: 'sunny',
    good: 'プロジェクトのメイン機能を予定より早く実装できた',
    more: 'コードレビューの待ち時間が長いと感じる',
    nextAction: 'レビュアーへのリマインド方法を改善する',
    memo: '田中さんは非常にモチベーションが高い。技術的な課題も自力で解決できている。',
    summary: '好調な進捗。レビュープロセスの最適化が次回の課題。',
    isPlanned: false,
  },
  {
    id: 'l2',
    memberId: '2',
    date: pastDate(3),
    mood: 'cloudy',
    good: '新しいデザインシステムの案がチームで承認された',
    more: '実装側とのコミュニケーションコストが高い',
    nextAction: 'エンジニアとの定例MTGを週1回追加する',
    memo: 'コミュニケーションのズレを気にしている。具体的な解決策を提案。',
    summary: 'デザイン承認は進んだが、連携面に懸念あり。定例化で対応。',
    isPlanned: false,
  },
  {
    id: 'l3',
    memberId: '3',
    date: pastDate(1),
    mood: 'rainy',
    good: '特に無し',
    more: '体調を崩しており、パフォーマンスが上がっていない',
    nextAction: '来週のタスク量を調整し、休養を促す',
    memo: 'プライベートで忙しく、睡眠不足の様子。無理をさせないようにする。',
    summary: '体調不良による低迷。リソース調整を行う。',
    isPlanned: false,
  },
  {
    id: 'l4',
    memberId: '1',
    date: futureDate(2),
    mood: 'sunny',
    good: '',
    more: '',
    nextAction: '',
    memo: '',
    summary: '',
    isPlanned: true,
  },
  {
    id: 'l5',
    memberId: '2',
    date: futureDate(5),
    mood: 'sunny',
    good: '',
    more: '',
    nextAction: '',
    memo: '',
    summary: '',
    isPlanned: true,
  },
  {
    id: 'l6',
    memberId: '4',
    date: futureDate(10),
    mood: 'sunny',
    good: '',
    more: '',
    nextAction: '',
    memo: '',
    summary: '',
    isPlanned: true,
  },
];
