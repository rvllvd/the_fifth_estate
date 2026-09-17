// Утилиты для работы с localStorage

const STORAGE_KEY = 'the_fifth_estate_save';

export type GameState = {
  // Показатели
  influence: number;      // Влияние (0-100)
  credibility: number;     // Доверие (0-100)
  budget: number;          // Бюджет (0-100)
  readership: number;      // Читатели (0-100)
  
  // Игровой процесс
  turn: number;            // Текущий ход
  maxTurns: number;        // Максимальное количество ходов
  
  // Статус игры
  gameOver: boolean;
  victory: boolean;
}

const INITIAL_STATE: GameState = {
  influence: 50,
  credibility: 50,
  budget: 50,
  readership: 50,
  turn: 1,
  maxTurns: 20,
  gameOver: false,
  victory: false
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