export type StatScale = number; // 0..100
export type Counter = number;  // >= 0
export type Theme = "light" | "dark" | "cyberpunk";

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
  journalistId?: string;
}

export interface PlacedNews {
  newsId: string;
  tier: number;
  slot: number;
}

export interface JournalistBonusContext {
  journalist: Journalist;
  news: NewsItem;
  relatedNews: NewsItem[];
  placedNewsItems: NewsItem[];
  placedNews: PlacedNews[];
  journalists: Journalist[];
  game: GameState;
}

export interface JournalistBonusResult {
  metrics: Metrics;
  explanation: string;
}

export type JournalistBonus = (
  context: JournalistBonusContext,
) => JournalistBonusResult;

export interface Journalist {
  id: string;
  name: string;
  role: string;
  bonus?: Metrics | JournalistBonus;
  cost: number;
  spec?: string;
  newsId?: string;
  desc?: string;
}

export interface PublishedNewsLogItem {
  newsId: string;
  title: string;
  category: string;
  tier: number;
  journalistName?: string;
  base: Metrics;
  bonus: Metrics;
  multiplier: number;
  final: Metrics;
  bonusDescription?: string;
}

export type NewsContribution = PublishedNewsLogItem;

export interface PublicationLogEntry {
  id: string;
  turn: number;
  publishedAt: number;
  gameTime?: number;
  news: PublishedNewsLogItem[];
  result: Metrics;
}

export interface GameState extends Stats {
  economyVersion?: number;
  // Игровой процесс
  turn: number;
  maxTurns: number;
  gameTime: number;
  gameTimeUpdatedAt: number;

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

  // История опубликованных выпусков
  publicationHistory: PublicationLogEntry[];

  // Статус игры
  gameOver?: boolean;
  victory?: boolean;
}

export type SlotAssignment = Record<string, NewsItem | null>;
// ключ вида "1-0", "2-1", "3-2" → tier-slot
