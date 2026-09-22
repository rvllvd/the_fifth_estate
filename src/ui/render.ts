import type { GameState } from '../utils/storage';

/**
 * Рендер показателей в верхней панели
 */
export function renderMetrics(state: GameState): void {
  const topPanel = document.getElementById('top-panel');
  if (!topPanel) return;
  
  // Определяем классы для цветов показателей
  const getMetricClass = (value: number): string => {
    if (value <= 20) return 'danger';
    if (value <= 40) return 'warning';
    return 'good';
  };
  
  topPanel.innerHTML = `
    <div class="metrics">
      <div class="metric">
        <span class="metric-label">Влияние</span>
        <span class="metric-value ${getMetricClass(state.influence)}">${state.influence}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Доверие</span>
        <span class="metric-value ${getMetricClass(state.credibility)}">${state.credibility}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Бюджет</span>
        <span class="metric-value ${getMetricClass(state.budget)}">${state.budget}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Читатели</span>
        <span class="metric-value ${getMetricClass(state.readership)}">${state.readership}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Ход</span>
        <span class="metric-value">${state.turn}/${state.maxTurns}</span>
      </div>
    </div>
    <button id="new-game-btn">Новая игра</button>
  `;
}

/**
 * Рендер панелей управления
 */
export function renderPanels(_state: GameState): void {
  // Панели рендерятся через HTML, эта функция пустая
  // В будущем можно добавить динамическое обновление статуса
}

/**
 * Рендер газеты
 */
export function renderNewspaper(_state: GameState): void {
  // Газета рендерится через HTML, эта функция пустая
  // В будущем можно добавить динамическое обновление
}

/**
 * Рендер лога событий
 */
export function renderLog(_state: GameState): void {
  // Лог уже рендерится через addLog, эта функция пока пустая
  // В будущем можно добавить первоначальное заполнение лога
}