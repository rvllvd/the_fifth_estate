import type { NewsItem } from '../types';

interface Props {
  news: NewsItem;
  placed: boolean;
}

const CATEGORY_NAMES: Record<string, string> = {
  politics: 'Политика',
  sports: 'Спорт',
  tech: 'Технологии',
  life: 'Жизнь',
};

export default function NewsCard({ news, placed }: Props) {
  const handleDragStart = (e: React.DragEvent) => {
    if (placed) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('application/json', JSON.stringify(news));
    e.dataTransfer.effectAllowed = 'move';
  };

  const effects = [
    { icon: '📈', value: news.effects.influence },
    { icon: '🎯', value: news.effects.credibility },
    { icon: '💰', value: news.effects.budget },
    { icon: '👥', value: news.effects.readership },
  ];

  return (
    <div
      className={`news-item ${placed ? 'placed' : ''}`}
      data-news-id={news.id}
      data-category={news.category}
      draggable={!placed}
      onDragStart={handleDragStart}
    //   style={placed ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
    >
      <div className="news-header">
        <span className="news-title">{news.title}</span>
        <span className="news-tag">{CATEGORY_NAMES[news.category] ?? news.category}</span>
      </div>
      <div className="news-content">{news.content}</div>
      <div className="news-effects">
        {effects.map((e, i) => (
          <span key={i} className="effect">
            {e.icon} {e.value > 0 ? '+' : ''}{e.value}
          </span>
        ))}
      </div>
    </div>
  );
}