import { GameState, saveState, loadState, clearState, getInitialState, hasSave } from './utils/storage';
import { renderMetrics, renderPanels, renderNewspaper, renderLog } from './ui/render';

class Game {
  private state: GameState;
  
  constructor() {
    // Загружаем сохранение или создаем новую игру
    const savedState = loadState();
    this.state = savedState || getInitialState();
    
    this.init();
  }
  
  private init(): void {
    this.render();
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) {
      newGameBtn.addEventListener('click', () => this.startNewGame());
    }
  }
  
  private startNewGame(): void {
    clearState();
    this.state = getInitialState();
    this.addLog('Новая игра начана!', 'turn');
    this.render();
  }
  
  private render(): void {
    renderMetrics(this.state);
    renderPanels(this.state);
    renderNewspaper(this.state);
    renderLog(this.state);
  }
  
  public getState(): GameState {
    return this.state;
  }
  
  public setState(newState: Partial<GameState>): void {
    this.state = { ...this.state, ...newState };
    saveState(this.state);
    this.render();
  }
  
  public addLog(message: string, type: 'turn' | 'good' | 'bad' | 'normal' = 'normal'): void {
    const log = document.getElementById('log');
    if (log) {
      const entry = document.createElement('div');
      entry.className = `log-entry ${type}`;
      entry.textContent = `[Ход ${this.state.turn}] ${message}`;
      log.appendChild(entry);
      log.scrollTop = log.scrollHeight;
    }
  }
}

// Глобальный экземпляр игры
let game: Game;

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  game = new Game();
  
  if (hasSave()) {
    game.addLog('Игра загружена из сохранения', 'normal');
  } else {
    game.addLog('Добро пожаловать в The Fifth Estate!', 'turn');
  }
});

// Экспорт для использования в других модулях
export { game };