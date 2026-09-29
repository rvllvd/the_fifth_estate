export class MetricsModal {
  private element: HTMLElement | null = null;
  
  constructor() {
    this.element = document.getElementById('metrics-modal');
  }
  
  public show(influence: number, credibility: number, budget: number, readership: number): void {
    const modal = this.element;
    if (!modal) return;
    
    // Устанавливаем начальные значения
    const modalInfluence = document.getElementById('modal-influence');
    const modalCredibility = document.getElementById('modal-credibility');
    const modalBudget = document.getElementById('modal-budget');
    const modalReadership = document.getElementById('modal-readership');
    
    if (modalInfluence) modalInfluence.textContent = '0';
    if (modalCredibility) modalCredibility.textContent = '0';
    if (modalBudget) modalBudget.textContent = '0';
    if (modalReadership) modalReadership.textContent = '0';
    
    // Показываем модальное окно
    modal.classList.add('show');
    
    // Анимируем значения с задержкой
    setTimeout(() => {
      this.animateMetricValue(modalInfluence, influence);
      this.animateMetricValue(modalCredibility, credibility);
      this.animateMetricValue(modalBudget, budget);
      this.animateMetricValue(modalReadership, readership);
    }, 300);
  }
  
  public hide(): void {
    const modal = this.element;
    if (!modal) return;
    modal.classList.remove('show');
  }
  
  private animateMetricValue(element: HTMLElement | null, targetValue: number): void {
    if (!element) return;
    
    const currentValue = parseInt(element.textContent || '0');
    const isPositive = targetValue > 0;
    const parent = element.closest('.metric-change');
    
    if (parent) {
      parent.classList.remove('positive', 'negative');
      parent.classList.add(isPositive ? 'positive' : 'negative');
    }
    
    // Анимация чисел
    let start = currentValue;
    const duration = 1000;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (targetValue - start) * easeOut);
      
      element.textContent = (current > 0 ? '+' : '') + current;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
}
