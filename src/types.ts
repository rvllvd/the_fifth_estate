export type StatScale = number; // 0..100
export type Counter = number; // >= 0

export interface Metrics {
  influence: StatScale;
  credibility: StatScale;
  reputation: StatScale;
  readership: StatScale;
}

export interface Resources {
  readers: Counter;
  money: Counter;
}

export interface Stats extends Metrics, Resources {}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: string;
  effects: Metrics;
}

export interface PlacedNews {
  newsId: string;
  tier: number;
  slot: number;
}

export interface Journalist {
  id: string;
  name: string;
  role: string;
  bonus: Metrics;
  cost: number;
}

export interface GameState extends Stats {
  // Игровой процесс
  turn: number;
  maxTurns: number;

  // Размещённые новости
  placedNews: PlacedNews[];

  // Сотрудники
  journalists: Journalist[];

  // Использованные новости
  usedNewsIds: string[];

  // Текущие доступные новости (10 на ход)
  currentNewsIds: string[];

  // Текущие категории (фиксируются на ход)
  currentCategories: string[];

  // Статус игры
  gameOver?: boolean;
  victory?: boolean;
}

export type SlotAssignment = Record<string, NewsItem | null>;
// ключ вида "1-0", "2-1", "3-2" → tier-slot
