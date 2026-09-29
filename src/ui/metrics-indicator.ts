import type { PlacedNews, Journalist } from '../utils/storage';
import { getNewsById } from '../data/news';

export interface MetricsChange {
  influence: number;
  credibility: number;
  budget: number;
  readership: number;
}

export class MetricsIndicator {
  private element: HTMLElement | null = null;
  
  constructor() {
    this.element = document.getElementById('metrics-preview');
  }
  
  public update(placedNews: PlacedNews[], journalists: Journalist[] = []): void {
    if (!this.element) return;
    
    const changes = this.calculateChanges(placedNews, journalists);
    this.render(changes);
  }
  
  private calculateChanges(placedNews: PlacedNews[], journalists: Journalist[]): MetricsChange {
    let influence = 0;
    let credibility = 0;
    let budget = 0;
    let readership = 0;
    
    // Рассчитываем эффекты от новостей
    placedNews.forEach((placed) => {
      const news = getNewsById(placed.newsId);
      if (!news) return;
      
      const multiplier = placed.tier === 1 ? 2 : placed.tier === 2 ? 1 : 0.5;
      
      influence += Math.round(news.effects.influence * multiplier);
      credibility += Math.round(news.effects.credibility * multiplier);
      budget += Math.round(news.effects.budget * multiplier);
      readership += Math.round(news.effects.readership * multiplier);
    });
    
    // Добавляем бонусы от сотрудников
    journalists.forEach(journalist => {
      influence += journalist.bonus.influence;
      credibility += journalist.bonus.credibility;
      budget += journalist.bonus.budget;
      readership += journalist.bonus.readership;
    });
    
    return { influence, credibility, budget, readership };
  }
  
  private render(changes: MetricsChange): void {
    if (!this.element) return;
    
    this.element.innerHTML = `
      <div class="metrics-preview-title">Прогноз изменений:</div>
      <div class="metrics-preview-values">
        <span class="preview-metric ${changes.influence >= 0 ? 'positive' : 'negative'}">
          📈 ${changes.influence > 0 ? '+' : ''}${changes.influence}
        </span>
        <span class="preview-metric ${changes.credibility >= 0 ? 'positive' : 'negative'}">
          🎯 ${changes.credibility > 0 ? '+' : ''}${changes.credibility}
        </span>
        <span class="preview-metric ${changes.budget >= 0 ? 'positive' : 'negative'}">
          💰 ${changes.budget > 0 ? '+' : ''}${changes.budget}
        </span>
        <span class="preview-metric ${changes.readership >= 0 ? 'positive' : 'negative'}">
          👥 ${changes.readership > 0 ? '+' : ''}${changes.readership}
        </span>
      </div>
    `;
  }
  
  public hide(): void {
    if (!this.element) return;
    this.render({ influence: 0, credibility: 0, budget: 0, readership: 0 });
  }
}
