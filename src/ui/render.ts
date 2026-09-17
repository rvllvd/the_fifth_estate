import { GameState } from '../utils/storage';

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
export function renderPanels(state: GameState): void {
  const leftPanel = document.getElementById('left-panel');
  if (!leftPanel) return;
  
  leftPanel.innerHTML = `
    <div class="panel-section">
      <div class="panel-title">Управление</div>
      <p style="font-size: 13px; color: #7f8c8d; margin-bottom: 10px;">
        Выберите новости для публикации в этом ходу.
      </p>
      <button class="action-btn" id="publish-btn" disabled>
        Опубликовать выбранные
      </button>
    </div>
    
    <div class="panel-section">
      <div class="panel-title">Статус</div>
      <p style="font-size: 13px; color: #7f8c8d;">
        ${state.gameOver ? 
          (state.victory ? '🎉 Победа!' : '💀 Поражение') : 
          'Игра продолжается...'}
      </p>
    </div>
  `;
  
  // Добавляем обработчик для кнопки публикации
  const publishBtn = document.getElementById('publish-btn');
  if (publishBtn) {
    publishBtn.addEventListener('click', () => {
      // Логика публикации будет добавлена позже
      console.log('Публикация новостей');
    });
  }
}

/**
 * Рендер газеты
 */
export function renderNewspaper(state: GameState): void {
  const newspaper = document.getElementById('newspaper');
  if (!newspaper) return;
  
  newspaper.innerHTML = `
    <div class="newspaper-header">
      <div class="newspaper-title">The Fifth Estate</div>
      <div class="newspaper-date">Ход ${state.turn} из ${state.maxTurns}</div>
    </div>
    
    <div class="news-cards">
      <div class="news-card">
        <h3>Демо-новость 1</h3>
        <p>Это демо-новость. В полной версии здесь будут реальные новости с эффектами.</p>
        <div class="news-effects">
          Влияние: +5 | Доверие: -3
        </div>
      </div>
      
      <div class="news-card">
        <h3>Демо-новость 2</h3>
        <p>Это демо-новость. В полной версии здесь будут реальные новости с эффектами.</p>
        <div class="news-effects">
          Бюджет: +10 | Читатели: +5
        </div>
      </div>
      
      <div class="news-card">
        <h3>Демо-новость 3</h3>
        <p>Это демо-новость. В полной версии здесь будут реальные новости с эффектами.</p>
        <div class="news-effects">
          Доверие: +8 | Влияние: -2
        </div>
      </div>
    </div>
  `;
  
  // Добавляем обработчики для карточек новостей
  const cards = newspaper.querySelectorAll('.news-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('selected');
      updatePublishButton();
    });
  });
}

/**
 * Рендер лога событий
 */
export function renderLog(state: GameState): void {
  const log = document.getElementById('log');
  if (!log) return;
  
  // Лог уже рендерится через addLog, эта функция пока пустая
  // В будущем можно добавить первоначальное заполнение лога
}

/**
 * Обновление состояния кнопки публикации
 */
function updatePublishButton(): void {
  const publishBtn = document.getElementById('publish-btn');
  const selectedCards = document.querySelectorAll('.news-card.selected');
  
  if (publishBtn) {
    publishBtn.disabled = selectedCards.length === 0 || selectedCards.length > 3;
  }
}