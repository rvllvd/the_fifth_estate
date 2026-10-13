import NewspaperColumn from "./NewspaperColumn";
import type { GameState, NewsItem, PlacedNews } from "../types";
import { GAME_BALANCE, getTierMultiplier } from "../constants/global";

interface Props {
  placedNews: PlacedNews[];
  gameState: GameState;
  isPublishing?: boolean;
  onDropNews: (key: string, news: NewsItem) => void;
  onRemove: (newsId: string) => void;
}

const COLUMNS = Object.entries(GAME_BALANCE.columns).map(
  ([tierValue, column]) => {
    const tier = Number(tierValue);
    const { slots } = column;
    const multiplier = getTierMultiplier(tier);
    const title =
      multiplier === 1 ? column.title : `${column.title} (x${multiplier})`;

    return { tier, title, slots, multiplier };
  },
);

export default function Newspaper({
  placedNews,
  gameState,
  isPublishing = false,
  onDropNews,
  onRemove,
}: Props) {
  return (
    <div id="newspaper" className={isPublishing ? "publish-scoring" : ""}>
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
              gameState={gameState}
              onDropNews={onDropNews}
              onRemove={onRemove}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
