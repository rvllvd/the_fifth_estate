// Утилиты для работы с localStorage

const STORAGE_KEY = 'the_fifth_estate_save';

export type NewsEffect = {
  influence: number;
  credibility: number;
  budget: number;
  readership: number;
};

export type NewsItem = {
  id: string;
  title: string;
  content: string;
  category: string;
  effects: NewsEffect;
};

export type PlacedNews = {
  newsId: string;
  tier: number;
  slot: number;
};

export type GameState = {
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
  
  // Статус игры
  gameOver?: boolean;
  victory?: boolean;
}

export const INITIAL_STATE: GameState = {
  influence: 50,
  credibility: 50,
  budget: 50,
  readership: 50,
  turn: 1,
  maxTurns: 20,
  placedNews: []
};

/**
 * Сохранить состояние игры в localStorage
 */
export function saveState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Ошибка сохранения:', e);
  }
}

/**
 * Загрузить состояние игры из localStorage
 */
export function loadState(): GameState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as GameState;
    }
  } catch (e) {
    console.error('Ошибка загрузки:', e);
  }
  return null;
}

/**
 * Удалить сохранение
 */
export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Ошибка удаления сохранения:', e);
  }
}

/**
 * Получить начальное состояние
 */
export function getInitialState(): GameState {
  return { ...INITIAL_STATE };
}

/**
 * Проверить, есть ли сохранение
 */
export function hasSave(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}