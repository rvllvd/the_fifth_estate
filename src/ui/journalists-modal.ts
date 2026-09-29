import type { Journalist } from '../utils/storage';
import { getAvailableJournalists } from '../data/journalists';

export class JournalistsModal {
  private element: HTMLElement | null = null;
  private onHire: (journalist: Journalist) => void;
  private onFire: (journalistId: string) => void;
  private currentJournalists: Journalist[] = [];
  
  constructor(onHire: (journalist: Journalist) => void, onFire: (journalistId: string) => void) {
    this.element = document.getElementById('journalists-modal');
    this.onHire = onHire;
    this.onFire = onFire;
  }
  
  public show(currentJournalists: Journalist[]): void {
    this.currentJournalists = currentJournalists;
    const modal = this.element;
    if (!modal) return;
    
    this.renderContent();
    modal.classList.add('show');
  }
  
  public hide(): void {
    const modal = this.element;
    if (!modal) return;
    modal.classList.remove('show');
  }
  
  private renderContent(): void {
    if (!this.element) return;
    
    const availableJournalists = getAvailableJournalists(this.currentJournalists);
    const canHire = this.currentJournalists.length < 6;
    const canFire = this.currentJournalists.length > 1;
    
    this.element.innerHTML = `
      <div class="journalists-modal-content">
        <div class="journalists-modal-header">
          <h2>Управление сотрудниками</h2>
          <button class="close-modal-btn">×</button>
        </div>
        
        <div class="journalists-section">
          <h3>Текущие сотрудники (${this.currentJournalists.length}/6)</h3>
          <div class="journalists-list current-journalists">
            ${this.currentJournalists.map(j => this.renderJournalistCard(j, true, canFire)).join('')}
          </div>
        </div>
        
        <div class="journalists-section">
          <h3>Доступные для найма</h3>
          <div class="journalists-list available-journalists">
            ${availableJournalists.map(j => this.renderJournalistCard(j, false, canHire)).join('')}
          </div>
        </div>
      </div>
    `;
    
    this.setupEventListeners();
  }
  
  private renderJournalistCard(journalist: Journalist, isCurrent: boolean, canAction: boolean): string {
    const actionButton = isCurrent 
      ? `<button class="fire-btn" data-id="${journalist.id}" ${!canAction ? 'disabled' : ''}>Уволить</button>`
      : `<button class="hire-btn" data-id="${journalist.id}" ${!canAction ? 'disabled' : ''}>Нанять</button>`;
    
    return `
      <div class="journalist-card" data-id="${journalist.id}">
        <div class="journalist-info">
          <div class="journalist-name">${journalist.name}</div>
          <div class="journalist-role">${journalist.role}</div>
        </div>
        <div class="journalist-stats">
          <div class="stat-row">
            <span class="stat-label">✍️ Влияние:</span>
            <span class="stat-value ${journalist.bonus.influence >= 0 ? 'positive' : 'negative'}">
              ${journalist.bonus.influence > 0 ? '+' : ''}${journalist.bonus.influence}
            </span>
          </div>
          <div class="stat-row">
            <span class="stat-label">🎯 Доверие:</span>
            <span class="stat-value ${journalist.bonus.credibility >= 0 ? 'positive' : 'negative'}">
              ${journalist.bonus.credibility > 0 ? '+' : ''}${journalist.bonus.credibility}
            </span>
          </div>
          <div class="stat-row">
            <span class="stat-label">💰 Бюджет:</span>
            <span class="stat-value ${journalist.bonus.budget >= 0 ? 'positive' : 'negative'}">
              ${journalist.bonus.budget > 0 ? '+' : ''}${journalist.bonus.budget}
            </span>
          </div>
          <div class="stat-row">
            <span class="stat-label">👥 Читатели:</span>
            <span class="stat-value ${journalist.bonus.readership >= 0 ? 'positive' : 'negative'}">
              ${journalist.bonus.readership > 0 ? '+' : ''}${journalist.bonus.readership}
            </span>
          </div>
          <div class="stat-row cost-row">
            <span class="stat-label">💵 Зарплата:</span>
            <span class="stat-value cost">-${journalist.cost}</span>
          </div>
        </div>
        <div class="journalist-actions">
          ${actionButton}
        </div>
      </div>
    `;
  }
  
  private setupEventListeners(): void {
    if (!this.element) return;
    
    // Закрытие модального окна
    const closeBtn = this.element.querySelector('.close-modal-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }
    
    // Наем сотрудника
    const hireBtns = this.element.querySelectorAll('.hire-btn');
    hireBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const journalistId = (e.target as HTMLElement).dataset.id;
        if (journalistId) {
          this.handleHire(journalistId);
        }
      });
    });
    
    // Увольнение сотрудника
    const fireBtns = this.element.querySelectorAll('.fire-btn');
    fireBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const journalistId = (e.target as HTMLElement).dataset.id;
        if (journalistId) {
          this.handleFire(journalistId);
        }
      });
    });
  }
  
  private handleHire(journalistId: string): void {
    const availableJournalists = getAvailableJournalists(this.currentJournalists);
    const journalist = availableJournalists.find(j => j.id === journalistId);
    
    if (journalist) {
      this.onHire(journalist);
      this.currentJournalists = [...this.currentJournalists, journalist];
      this.renderContent();
    }
  }
  
  private handleFire(journalistId: string): void {
    if (this.currentJournalists.length <= 1) return;
    
    this.onFire(journalistId);
    this.currentJournalists = this.currentJournalists.filter(j => j.id !== journalistId);
    this.renderContent();
  }
}
