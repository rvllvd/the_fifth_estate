import StaffSection from './StaffSection';
import NewsSection from './NewsSection';
import type { Journalist, NewsItem } from '../types';

interface LogEntry {
  id: number;
  text: string;
  type: string;
}

interface Props {
  // Новости
  news: NewsItem[];            // уже отфильтрованные по категории
  placedNewsIds: Set<string>;
  canPublish: boolean;
  placedCount: number;
  onPublish: () => void;
  onClear: () => void;

  // Сотрудники
  staff: Journalist[];
  onOpenJournalists: () => void;

  // Логи
  logs: LogEntry[];
}

export default function LeftPanel({
  news,
  placedNewsIds,
  canPublish,
  placedCount,
  onPublish,
  onClear,
  staff,
  onOpenJournalists,
  logs,
}: Props) {
  return (
    <div id="left-panel">
      <StaffSection staff={staff} onOpenJournalists={onOpenJournalists} />

      <NewsSection
        news={news}
        placedNewsIds={placedNewsIds}
        canPublish={canPublish}
        placedCount={placedCount}
        onPublish={onPublish}
        onClear={onClear}
      />

      {/* <div className="panel-section" id="log-section" >
        <div className="panel-title">📜 Журнал</div>
        <div id="log">
          {logs.map((entry) => (
            <div key={entry.id} className={`log-entry ${entry.type}`}>
              {entry.text}
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
}