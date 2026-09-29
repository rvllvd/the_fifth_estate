// Утилиты для работы с localStorage

const STORAGE_KEY = 'the_fifth_estate_save';

export const Parameters = {
  countNews: 6,
};

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

export type Journalist = {
  id: string;
  name: string;
  role: string;
  bonus: NewsEffect;
  cost: number;
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
  
  // Сотрудники
  journalists: Journalist[];
  
  // Статус игры
  gameOver?: boolean;
  victory?: boolean;
}

const INITIAL_STATE: GameState = {
  influence: 50,
  credibility: 50,
  budget: 50,
  readership: 50,
  turn: 1,
  maxTurns: 20,
  placedNews: [],
  journalists: []
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
  return { 
    ...INITIAL_STATE,
    journalists: getInitialJournalists()
  };
}

/**
 * Получить начальных сотрудников
 */
function getInitialJournalists(): Journalist[] {
  return [
    {
      id: 'ivan_petrov',
      name: 'Иван Петров',
      role: 'Политический обозреватель',
      bonus: {
        influence: 8,
        credibility: 0,
        budget: -5,
        readership: 0
      },
      cost: 5
    },
    {
      id: 'maria_sidorova',
      name: 'Мария Сидорова',
      role: 'Спортивный журналист',
      bonus: {
        influence: 6,
        credibility: 0,
        budget: -4,
        readership: 0
      },
      cost: 4
    },
    {
      id: 'alexey_kozlov',
      name: 'Алексей Козлов',
      role: 'Технологический обозреватель',
      bonus: {
        influence: 7,
        credibility: 0,
        budget: -6,
        readership: 0
      },
      cost: 6
    }
  ];
}

/**
 * Проверить, есть ли сохранение
 */
export function hasSave(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}