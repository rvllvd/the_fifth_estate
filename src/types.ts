export interface Metrics {
  influence: number;
  credibility: number;
  budget: number;
  readership: number;
}
export interface NewsEffect {
  influence: number;
  credibility: number;
  budget: number;
  readership: number;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: string;
  effects: NewsEffect;
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
  bonus: NewsEffect;
  cost: number;
}

export interface GameState {
  // Показатели
  influence: number;
  credibility: number;
  budget: number;
  readership: number;

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