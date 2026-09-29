import NewspaperColumn from './NewspaperColumn';
import type { NewsItem, PlacedNews } from '../types';

interface Props {
  placedNews: PlacedNews[];
  onDropNews: (key: string, news: NewsItem) => void;
  onRemove: (newsId: string) => void;
}

const COLUMNS = [
  { tier: 1, title: 'Главная полоса (x2)',  slots: 1, multiplier: 2 },
  { tier: 2, title: 'Вторая полоса',         slots: 2, multiplier: 1 },
  { tier: 3, title: 'Третья полоса (x0.5)',  slots: 3, multiplier: 0.5 },
];

export default function Newspaper({ placedNews, onDropNews, onRemove }: Props) {
  return (
    <div id="newspaper">
      <div className="newspaper-page">
        <div className="newspaper-header">
          <div className="newspaper-title">The Fifth Estate</div>
        </div>

        <div className="newspaper-content">
          {COLUMNS.map((col) => (
            <NewspaperColumn
              key={col.tier}
              tier={col.tier}
              title={col.title}
              slotsCount={col.slots}
              multiplier={col.multiplier}
              placedNews={placedNews}
              onDropNews={onDropNews}
              onRemove={onRemove}
            />
          ))}
        </div>
      </div>
    </div>
  );
}