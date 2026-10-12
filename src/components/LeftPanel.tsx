import StaffSection from "./StaffSection";
import NewsSection from "./NewsSection";
import type { GameState, Journalist, NewsItem } from "../types";

interface Props {
  // Новости
  news: NewsItem[]; // уже отфильтрованные по категории
  placedNewsIds: Set<string>;
  canPublish: boolean;
  placedCount: number;
  onPublish: () => void;
  onClear: () => void;

  // Сотрудники
  staff: Journalist[];
  gameState: GameState;
  onOpenJournalists: () => void;
  showDeveloperTools: boolean;
  autoPlayEnabled: boolean;
  autoPlayMessage: string;
  onToggleAutoPlay: () => void;
}

export default function LeftPanel({
  news,
  placedNewsIds,
  canPublish,
  placedCount,
  onPublish,
  onClear,
  staff,
  gameState,
  onOpenJournalists,
  showDeveloperTools,
  autoPlayEnabled,
  autoPlayMessage,
  onToggleAutoPlay,
}: Props) {
  return (
    <div id="left-panel">
      <StaffSection staff={staff} onOpenJournalists={onOpenJournalists} />

      <NewsSection
        news={news}
        placedNewsIds={placedNewsIds}
        journalists={staff}
        gameState={gameState}
        canPublish={canPublish}
        placedCount={placedCount}
        onPublish={onPublish}
        onClear={onClear}
        showDeveloperTools={showDeveloperTools}
        autoPlayEnabled={autoPlayEnabled}
        autoPlayMessage={autoPlayMessage}
        onToggleAutoPlay={onToggleAutoPlay}
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
