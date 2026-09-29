import type { NewsItem, PlacedNews } from '../types.ts';
import { playSound } from './sounds.ts'

let draggedNews: NewsItem | null = null;
let draggedElement: HTMLElement | null = null;

export function setupDragAndDrop(): void {
  setupNewsDragStart();
}

function setupNewsDragStart(): void {
  document.addEventListener('click', (e) => {
    if (draggedNews) {
      // Если перетаскиваем, проверяем клик на колонку
      const column = (e.target as HTMLElement).closest('.newspaper-column') as HTMLElement | null;
      if (column) {
        placeNewsInColumn(column);
      } else {
        cancelDragging();
      }
      return;
    }

    // Если не перетаскиваем, начинаем
    const newsItem = (e.target as HTMLElement).closest('.news-item') as HTMLElement | null;
    if (!newsItem) return;

    const newsId = newsItem.dataset.newsId;
    if (!newsId) return;

    startDragging(newsItem, newsId);
  });
}

function startDragging(element: HTMLElement, newsId: string): void {
  import('../data/news').then(({ getNewsById }) => {
    const news = getNewsById(newsId);
    if (!news) return;

    draggedNews = news;
    draggedElement = element.cloneNode(true) as HTMLElement;
    
    draggedElement.style.position = 'fixed';
    draggedElement.style.zIndex = '1000';
    draggedElement.style.pointerEvents = 'none';
    draggedElement.style.opacity = '0.8';
    draggedElement.style.transform = 'scale(1.05)';
    draggedElement.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
    
    document.body.appendChild(draggedElement);
    highlightColumns(true);
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', onDocumentClick);
  }).catch(err => {
    console.error('Failed to import news:', err);
  });
}

function onMouseMove(e: MouseEvent): void {
  if (!draggedElement) return;
  draggedElement.style.left = `${e.clientX + 10}px`;
  draggedElement.style.top = `${e.clientY + 10}px`;
}

function onDocumentClick(e: MouseEvent): void {
  // Убираем listeners сначала
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('click', onDocumentClick);
  
  const column = (e.target as HTMLElement).closest('.newspaper-column') as HTMLElement | null;
  if (column) {
    placeNewsInColumn(column);
    playSound('/assets/sounds/newspaper_folded_drop_on_floor_001.mp3', 0.9);
  } else {
    cancelDragging();
  }
}

function highlightColumns(highlight: boolean): void {
  const columns = document.querySelectorAll('.newspaper-column');
  columns.forEach(column => {
    if (highlight) {
      column.classList.add('drag-over');
    } else {
      column.classList.remove('drag-over');
    }
  });
}

function placeNewsInColumn(column: HTMLElement): void {
  
  if (!draggedNews) return;

  const tier = parseInt(column.dataset.tier || '1');
  const slots = column.querySelectorAll('.empty-slot:not(:has(.placed-news))');
  if (slots.length === 0) {
    cancelDragging();
    return;
  }

  const slot = slots[0] as HTMLElement;
  const slotIndex = parseInt(slot.dataset.slot || '0');

  
  const placedNewsElement = createPlacedNewsElement(draggedNews, tier);
  slot.innerHTML = '';
  slot.appendChild(placedNewsElement);

  const draggedNewsId = draggedNews!.id;
  import('../main').then(({ getGame }) => {
    const game = getGame();
    const currentState = game.getState();
    const newPlacedNews: PlacedNews = {
      newsId: draggedNewsId,
      tier: tier,
      slot: slotIndex
    };
    
    game.setState({
      placedNews: [...currentState.placedNews, newPlacedNews]
    });
    
    // Обновляем кнопку публикации
    const publishBtn = document.getElementById('publish-btn') as HTMLButtonElement | null;
    if (publishBtn) {
      game.updatePublishButton()
      
    }
  });

  const originalNewsItem = document.querySelector(`.news-item[data-news-id="${draggedNews.id}"]`) as HTMLElement | null;
  if (originalNewsItem) {
    originalNewsItem.classList.add('placed');
    originalNewsItem.style.opacity = '0.5';
    originalNewsItem.style.pointerEvents = 'none';
  }

  cancelDragging();
}

function createPlacedNewsElement(news: NewsItem, tier: number): HTMLElement {
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

function cancelDragging(): void {
  if (draggedElement) {
    draggedElement.remove();
    draggedElement = null;
  }
  draggedNews = null;
  highlightColumns(false);
}