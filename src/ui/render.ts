import type { GameState, Journalist } from '../utils/storage';

/**
 * Рендер показателей в верхней панели
 */
export function renderMetrics(state: GameState): void {
  // Определяем классы для цветов показателей
  const getMetricClass = (value: number): string => {
    if (value <= 20) return 'danger';
    if (value <= 40) return 'warning';
    return 'good';
  };
  
  // Обновляем значения показателей
  const influence = document.getElementById('influence');
  const credibility = document.getElementById('credibility');
  const budget = document.getElementById('budget');
  const readership = document.getElementById('readership');
  const turn = document.getElementById('turn');
  
  if (influence) {
    influence.textContent = state.influence.toString();
    influence.className = `metric-value ${getMetricClass(state.influence)}`;
  }
  
  if (credibility) {
    credibility.textContent = state.credibility.toString();
    credibility.className = `metric-value ${getMetricClass(state.credibility)}`;
  }
  
  if (budget) {
    budget.textContent = state.budget.toString();
    budget.className = `metric-value ${getMetricClass(state.budget)}`;
  }
  
  if (readership) {
    readership.textContent = state.readership.toString();
    readership.className = `metric-value ${getMetricClass(state.readership)}`;
  }
  
  if (turn) {
    turn.textContent = state.turn.toString();
  }
  
  // Обновляем прогресс-бары
  const influenceBar = document.getElementById('influence-bar');
  const credibilityBar = document.getElementById('credibility-bar');
  const budgetBar = document.getElementById('budget-bar');
  const readershipBar = document.getElementById('readership-bar');
  
  if (influenceBar) {
    influenceBar.style.width = `${state.influence}%`;
  }
  
  if (credibilityBar) {
    credibilityBar.style.width = `${state.credibility}%`;
  }
  
  if (budgetBar) {
    budgetBar.style.width = `${state.budget}%`;
  }
  
  if (readershipBar) {
    readershipBar.style.width = `${state.readership}%`;
  }
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

/**
 * Рендер списка сотрудников
 */
export function renderStaff(journalists: Journalist[]): void {
  const staffList = document.getElementById('staff-list');
  if (!staffList) return;
  
  if (journalists.length === 0) {
    staffList.innerHTML = '<div class="empty-staff">Нет сотрудников</div>';
    return;
  }
  
  staffList.innerHTML = journalists.map(journalist => `
    <div class="staff-card">
      <div class="staff-info">
        <span class="staff-name">${journalist.name}</span>
        <span class="staff-role">${journalist.role}</span>
      </div>
      <div class="staff-stats">
        <span class="staff-stat">📈 ${journalist.bonus.influence > 0 ? '+' : ''}${journalist.bonus.influence}</span>
        <span class="staff-stat">🎯 ${journalist.bonus.credibility > 0 ? '+' : ''}${journalist.bonus.credibility}</span>
        <span class="staff-stat">💰 ${journalist.bonus.budget > 0 ? '+' : ''}${journalist.bonus.budget}</span>
        <span class="staff-stat">👥 ${journalist.bonus.readership > 0 ? '+' : ''}${journalist.bonus.readership}</span>
      </div>
    </div>
  `).join('');
}