import type { GameState, NewsItem } from './utils/storage';
import { saveState, loadState, clearState, getInitialState, hasSave } from './utils/storage';
import { renderMetrics, renderPanels, renderNewspaper, renderLog, renderStaff } from './ui/render';
import { setupDragAndDrop } from './utils/dragdrop';
import { getNewsByCategory, getNewsById, getAllCategory } from './data/news';
import type { PlacedNews } from './utils/storage';
import { Parameters } from './utils/storage';
import { MetricsIndicator } from './ui/metrics-indicator';
import { MetricsModal } from './ui/metrics-modal';
import { JournalistsModal } from './ui/journalists-modal';
import { AVAILABLE_JOURNALISTS } from './data/journalists';

// Fonts
import "@fontsource/roboto";
import "@fontsource/unifrakturmaguntia";
import "@fontsource/cormorant-garamond";

class Game {
  private state: GameState;
  private metricsIndicator: MetricsIndicator;
  private metricsModal: MetricsModal;
  private journalistsModal: JournalistsModal;
  
  constructor() {
    // Загружаем сохранение или создаем новую игру
    const savedState = loadState();
    this.state = savedState || getInitialState();
    
    // Инициализируем сотрудников для новой игры или если поле отсутствует
    if (!savedState || !this.state.journalists) {
      this.state.journalists = AVAILABLE_JOURNALISTS.slice(0, 3);
    }
    
    this.metricsIndicator = new MetricsIndicator();
    this.metricsModal = new MetricsModal();
    this.journalistsModal = new JournalistsModal(
      (journalist) => this.hireJournalist(journalist),
      (journalistId) => this.fireJournalist(journalistId)
    );
    
    this.init();
  }
  
  private init(): void {
    this.render();
    this.renderNewsList();
    this.renderCategories();
    this.setupEventListeners();
    this.updatePublishButton();
    this.restorePlacedNews();
    this.metricsIndicator.update(this.state.placedNews, this.state.journalists);

    setupDragAndDrop();
  }

  private renderCategories() {
    const newsCategories = document.getElementById("news-categories") 
    if (newsCategories) {
      getAllCategory().forEach(category => newsCategories.innerHTML += `<button class="category-btn" data-category="${category}">${category}</button>`)
    } 
  }

  private setupEventListeners(): void {
    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) {
      newGameBtn.addEventListener('click', () => this.startNewGame());
    }
    
    const publishBtn = document.getElementById('publish-btn');
    if (publishBtn) {
      publishBtn.addEventListener('click', () => this.publishNewspaper());
    }
    
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearNewspaper());
    }
    
    const hireBtn = document.getElementById('hire-btn');
    if (hireBtn) {
      hireBtn.addEventListener('click', () => {
        console.log('Hire button clicked');
        this.openJournalistsModal();
      });
    } else {
      console.log('Hire button not found');
    }
    
    document.addEventListener('click', (e) => {
      const removeBtn = (e.target as HTMLElement).closest('.remove-news-btn') as HTMLElement | null;
      if (removeBtn) {
        const newsId = removeBtn.dataset.newsId;
        if (newsId) {
          this.removeNewsFromColumn(newsId);
        }
      }
    });
    
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const category = (btn as HTMLElement).dataset.category || 'all';
        this.renderNewsList(category);
      });
    });
  }
  
  private startNewGame(): void {
    clearState();
    this.state = getInitialState();
    this.state.journalists = AVAILABLE_JOURNALISTS.slice(0, 3);
    this.addLog('Новая игра начана!', 'turn');
    this.render();
    this.clearNewspaperSlots();
    this.metricsIndicator.update([], this.state.journalists);
  }
  
  private clearNewspaper(): void {
    this.setState({ placedNews: [] });
    this.clearNewspaperSlots();
    this.addLog('Газета очищена', 'normal');
  }
  
  private clearNewspaperSlots(): void {
    document.querySelectorAll('.empty-slot').forEach(slot => {
      slot.innerHTML = '<div class="slot-placeholder">Перетащите новость сюда</div>';
    });
    
    document.querySelectorAll('.news-item').forEach(item => {
      item.classList.remove('placed');
      (item as HTMLElement).style.opacity = '1';
      (item as HTMLElement).style.pointerEvents = 'auto';
    });
  }
  
  private openJournalistsModal(): void {
    console.log('Opening journalists modal with:', this.state.journalists);
    this.journalistsModal.show(this.state.journalists || []);
  }
  
  private hireJournalist(journalist: any): void {
    this.setState({
      journalists: [...this.state.journalists, journalist]
    });
    this.addLog(`${journalist.name} нанят на работу!`, 'good');
    this.metricsIndicator.update(this.state.placedNews, this.state.journalists);
    renderStaff(this.state.journalists);
  }
  
  private fireJournalist(journalistId: string): void {
    const journalist = this.state.journalists.find(j => j.id === journalistId);
    if (!journalist) return;
    
    this.setState({
      journalists: this.state.journalists.filter(j => j.id !== journalistId)
    });
    this.addLog(`${journalist.name} уволен`, 'bad');
    this.metricsIndicator.update(this.state.placedNews, this.state.journalists);
    renderStaff(this.state.journalists);
  }
  
  private render(): void {
    renderMetrics(this.state);
    renderPanels(this.state);
    renderNewspaper(this.state);
    renderLog(this.state);
    renderStaff(this.state.journalists);
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
  
  private renderNewsList(category: string = 'all'): void {
    const newsList = document.getElementById('news-list');
    if (!newsList) return;
    
    const news = getNewsByCategory(category);
    
    newsList.innerHTML = news.map((item: NewsItem) => `
      <div class="news-item" data-news-id="${item.id}" data-category="${item.category}">
        <div class="news-header">
          <span class="news-title">${item.title}</span>
          <span class="news-tag">${this.getCategoryName(item.category)}</span>
        </div>
        <div class="news-content">${item.content}</div>
        <div class="news-effects">
          <span class="effect">📈 ${item.effects.influence > 0 ? '+' : ''}${item.effects.influence}</span>
          <span class="effect">🎯 ${item.effects.credibility > 0 ? '+' : ''}${item.effects.credibility}</span>
          <span class="effect">💰 ${item.effects.budget > 0 ? '+' : ''}${item.effects.budget}</span>
          <span class="effect">👥 ${item.effects.readership > 0 ? '+' : ''}${item.effects.readership}</span>
        </div>  
      </div>
    `).join('');
  }
  
  private getCategoryName(category: string): string {
    const names: Record<string, string> = {
      'politics': 'Политика',
      'sports': 'Спорт',
      'tech': 'Технологии',
      'life': 'Жизнь'
    };
    return names[category] || category;
  }
  
  public updatePublishButton(): void {
    const publishBtn = document.getElementById('publish-btn') as HTMLButtonElement | null;
    if (!publishBtn) return;
    
    const placedCount = this.state.placedNews.length;
    publishBtn.textContent = `Опубликовать (${placedCount})`;
    publishBtn.disabled = placedCount < Parameters.countNews;
    
    this.metricsIndicator.update(this.state.placedNews, this.state.journalists);
  }
  
  private restorePlacedNews(): void {
    this.state.placedNews.forEach((placed: PlacedNews) => {
      const news = getNewsById(placed.newsId);
      if (!news) return;
      
      const column = document.querySelector(`.newspaper-column[data-tier="${placed.tier}"]`);
      if (!column) return;
      
      const slot = column.querySelector(`.empty-slot[data-slot="${placed.slot}"]`);
      if (!slot) return;
      
      const placedNewsElement = this.createPlacedNewsElement(news, placed.tier);
      slot.innerHTML = '';
      slot.appendChild(placedNewsElement);
      
      const newsItem = document.querySelector(`.news-item[data-news-id="${news.id}"]`) as HTMLElement | null;
      if (newsItem) {
        newsItem.classList.add('placed');
        newsItem.style.opacity = '0.5';
        newsItem.style.pointerEvents = 'none';
      }
    });
  }
  
  private createPlacedNewsElement(news: any, tier: number): HTMLElement {
    const element = document.createElement('div');
    element.className = 'placed-news';
    element.dataset.newsId = news.id;
    element.dataset.tier = tier.toString();
    
    const multiplier = tier === 1 ? 2 : tier === 2 ? 1 : 0.5;
    
    element.innerHTML = `
      <div class="placed-news-header">
        <span class="placed-news-title">${news.title}</span>
        <button class="remove-news-btn" data-news-id="${news.id}">×</button>
      </div>
      <div class="placed-news-content">${news.content}</div>
      <div class="placed-news-effects">
        <span class="effect">📈 Влияние: ${Math.round(news.effects.influence * multiplier)}</span>
        <span class="effect">🎯 Доверие: ${Math.round(news.effects.credibility * multiplier)}</span>
        <span class="effect">💰 Бюджет: ${Math.round(news.effects.budget * multiplier)}</span>
        <span class="effect">👥 Читатели: ${Math.round(news.effects.readership * multiplier)}</span>
      </div>
    `;

    return element;
  }
  
  private removeNewsFromColumn(newsId: string): void {
    const originalNewsItem = document.querySelector(`.news-item[data-news-id="${newsId}"]`) as HTMLElement | null;
    if (originalNewsItem) {
      originalNewsItem.classList.remove('placed');
      originalNewsItem.style.opacity = '1';
      originalNewsItem.style.pointerEvents = 'auto';
    }

    const placedNews = document.querySelector(`.placed-news[data-news-id="${newsId}"]`);
    if (placedNews) {
      const slot = placedNews.parentElement;
      if (slot) {
        slot.innerHTML = '<div class="slot-placeholder">Перетащите новость сюда</div>';
      }
    }

    this.setState({
      placedNews: this.state.placedNews.filter((pn: PlacedNews) => pn.newsId !== newsId)
    });
    
    this.updatePublishButton();
    this.metricsIndicator.update(this.state.placedNews, this.state.journalists);
  }
  
  private publishNewspaper(): void {
    if (this.state.placedNews.length === 0) {
      this.addLog('Сначала разместите новости в газете!', 'bad');
      return;
    }
    
    let totalInfluence = 0;
    let totalCredibility = 0;
    let totalBudget = 0;
    let totalReadership = 0;
    
    // Рассчитываем эффекты от новостей
    this.state.placedNews.forEach((placed: PlacedNews) => {
      const news = getNewsById(placed.newsId);
      if (!news) return;
      
      const multiplier = placed.tier === 1 ? 2 : placed.tier === 2 ? 1 : 0.5;
      
      totalInfluence += Math.round(news.effects.influence * multiplier);
      totalCredibility += Math.round(news.effects.credibility * multiplier);
      totalBudget += Math.round(news.effects.budget * multiplier);
      totalReadership += Math.round(news.effects.readership * multiplier);
    });
    
    // Добавляем бонусы от сотрудников
    const journalistBonuses = this.calculateJournalistBonuses();
    totalInfluence += journalistBonuses.influence;
    totalCredibility += journalistBonuses.credibility;
    totalBudget += journalistBonuses.budget;
    totalReadership += journalistBonuses.readership;
    
    // Показываем модальное окно с анимацией
    this.metricsModal.show(totalInfluence, totalCredibility, totalBudget, totalReadership);
    
    // После анимации скрываем окно и обновляем состояние игры
    setTimeout(() => {
      this.metricsModal.hide();
      this.applyPublicationEffects(totalInfluence, totalCredibility, totalBudget, totalReadership);
    }, 2000);
  }
  
  private calculateJournalistBonuses(): { influence: number; credibility: number; budget: number; readership: number } {
    let influence = 0;
    let credibility = 0;
    let budget = 0;
    let readership = 0;
    
    this.state.journalists.forEach(journalist => {
      influence += journalist.bonus.influence;
      credibility += journalist.bonus.credibility;
      budget += journalist.bonus.budget;
      readership += journalist.bonus.readership;
    });
    
    return { influence, credibility, budget, readership };
  }
  
  private applyPublicationEffects(influence: number, credibility: number, budget: number, readership: number): void {
    const newState: Partial<GameState> = {
      influence: Math.max(0, Math.min(100, this.state.influence + influence)),
      credibility: Math.max(0, Math.min(100, this.state.credibility + credibility)),
      budget: Math.max(0, Math.min(100, this.state.budget + budget)),
      readership: Math.max(0, Math.min(100, this.state.readership + readership)),
      turn: this.state.turn + 1,
      placedNews: []
    };
    
    const isGameOver = newState.turn! > this.state.maxTurns;
    const isVictory = newState.influence! >= 70 && newState.credibility! >= 70;
    
    this.setState(newState);
    
    this.addLog(`Газета опубликована!`, 'good');
    this.addLog(`Влияние: ${influence > 0 ? '+' : ''}${influence}`, influence > 0 ? 'good' : 'bad');
    this.addLog(`Доверие: ${credibility > 0 ? '+' : ''}${credibility}`, credibility > 0 ? 'good' : 'bad');
    this.addLog(`Бюджет: ${budget > 0 ? '+' : ''}${budget}`, budget > 0 ? 'good' : 'bad');
    this.addLog(`Читатели: ${readership > 0 ? '+' : ''}${readership}`, readership > 0 ? 'good' : 'bad');
    
    // Показываем бонусы от сотрудников
    if (this.state.journalists.length > 0) {
      this.addLog(`Бонусы сотрудников:`, 'normal');
      this.state.journalists.forEach(journalist => {
        const bonusText = [
          journalist.bonus.influence !== 0 ? `Влияние ${journalist.bonus.influence > 0 ? '+' : ''}${journalist.bonus.influence}` : '',
          journalist.bonus.credibility !== 0 ? `Доверие ${journalist.bonus.credibility > 0 ? '+' : ''}${journalist.bonus.credibility}` : '',
          journalist.bonus.budget !== 0 ? `Бюджет ${journalist.bonus.budget > 0 ? '+' : ''}${journalist.bonus.budget}` : '',
          journalist.bonus.readership !== 0 ? `Читатели ${journalist.bonus.readership > 0 ? '+' : ''}${journalist.bonus.readership}` : ''
        ].filter(Boolean).join(', ');
        
        if (bonusText) {
          this.addLog(`  ${journalist.name}: ${bonusText}`, 'normal');
        }
      });
    }
    
    if (isGameOver) {
      if (isVictory) {
        this.addLog('🎉 ПОБЕДА! Вы стали влиятельным изданием!', 'good');
      } else {
        this.addLog('💀 ПОРАЖЕНИЕ! Ваше издание закрылось.', 'bad');
      }
    } else {
      this.addLog(`Ход ${newState.turn}`, 'turn');
    }
    
    this.clearNewspaperSlots();
    this.renderNewsList();
    this.metricsIndicator.update([], this.state.journalists);
  }
}

// Глобальный экземпляр игры
let game: Game | null = null;

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  game = new Game();
  
  if (hasSave()) {
    game.addLog('Игра загружена из сохранения', 'normal');
  } else {
    game.addLog('Добро пожаловать в The Fifth Estate!', 'turn');
  }
});

export function getGame(): Game {
  if (!game) {
    game = new Game();
  }
  return game;
}

export default getGame;

// Экспорт для использования в других модулях
export { game };