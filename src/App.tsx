import { useEffect, useMemo, useState } from "react";
import TopPanel from "./components/TopPanel";
import LeftPanel from "./components/LeftPanel";
import Newspaper from "./components/Newspaper";
import MetricsModal from "./components/MetricsModal";
import JournalistsModal from "./components/JournalistsModal";
import type { Metrics, NewsItem } from "./types";
import { playSound } from "./utils/sounds";
import { getNewsById } from "./data/news";
import { AVAILABLE_JOURNALISTS } from "./data/journalists";
import { useBackgroundMusic } from "./hooks/useBackgroundMusic";
import { calculatePublicationResult } from "./utils/game_logic";
import { useGameStore, selectCanPublish } from "./store/gameStore";

export default function App() {
  useBackgroundMusic("/assets/sounds/city-noise.mp3", 0.75);

  const [modalResult, setModalResult] = useState<Metrics | null>(null);
  const [showJournalistsModal, setShowJournalistsModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // читаем
  const turn = useGameStore((s) => s.turn);
  const influence = useGameStore((s) => s.influence);
  const credibility = useGameStore((s) => s.credibility);
  const reputation = useGameStore((s) => s.reputation);
  const readership = useGameStore((s) => s.readership);
  const currentNewsIds = useGameStore((s) => s.currentNewsIds);
  const usedNewsIds = useGameStore((s) => s.usedNewsIds);
  const placedNews = useGameStore((s) => s.placedNews);
  const journalists = useGameStore((s) => s.journalists);
  const canPublishNow = useGameStore(selectCanPublish);

  // экшены
  const rollCurrentNews = useGameStore((s) => s.rollCurrentNews);
  const dropNews = useGameStore((s) => s.dropNews);
  const removePlaced = useGameStore((s) => s.removePlaced);
  const clearNewspaper = useGameStore((s) => s.clearNewspaper);
  const hireJournalist = useGameStore((s) => s.hireJournalist);
  const fireJournalist = useGameStore((s) => s.fireJournalist);
  const publishStore = useGameStore((s) => s.publish);
  const applyResult = useGameStore((s) => s.applyResult);
  const newGame = useGameStore((s) => s.newGame);

  // подкачка новостей
  useEffect(() => {
    rollCurrentNews();
  }, [rollCurrentNews, currentNewsIds.length, usedNewsIds.length]);

  // звук кликов
  useEffect(() => {
    const handler = () =>
      playSound("/assets/sounds/menu-button-click.mp3", 0.9);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const currentNews = useMemo<NewsItem[]>(
    () =>
      currentNewsIds
        .map((id) => getNewsById(id))
        .filter((n): n is NewsItem => Boolean(n)),
    [currentNewsIds],
  );

  const filteredNews = useMemo(
    () =>
      activeCategory === "all"
        ? currentNews
        : currentNews.filter((n) => n.category === activeCategory),
    [currentNews, activeCategory],
  );

  const placedNewsIds = useMemo(
    () => new Set(placedNews.map((p) => p.newsId)),
    [placedNews],
  );

  const preview = useMemo(
    () => calculatePublicationResult(placedNews, journalists),
    [placedNews, journalists],
  );

  const handleNewGame = () => {
    newGame();
    setActiveCategory("all");
  };

  const handleRemovePlaced = (newsId: string) => {
    removePlaced(newsId);
    playSound("/assets/sounds/newspaper_grab_pick_up_001_30856.mp3", 1);
  };

  const handleClearNewspaper = () => {
    clearNewspaper();
    playSound("/assets/sounds/clear.mp3", 1);
  };

  const handlePublish = () => {
    const result = publishStore();
    if (!result) return;
    setModalResult(result);
    playSound("/assets/sounds/newspaper.mp3", 1);
  };

  const handleModalClose = () => {
    if (!modalResult) return;
    applyResult(modalResult);
    setModalResult(null);
  };

  return (
    <>
      <div id="app">
        <TopPanel
          metrics={{ influence, credibility, reputation, readership }}
          turn={turn}
          onNewGame={handleNewGame}
          preview={preview}
        />
        <div id="main-content">
          <LeftPanel
            news={filteredNews}
            placedNewsIds={placedNewsIds}
            canPublish={canPublishNow}
            placedCount={placedNews.length}
            onPublish={handlePublish}
            onClear={handleClearNewspaper}
            staff={journalists}
            onOpenJournalists={() => setShowJournalistsModal(true)}
          />
          <Newspaper
            placedNews={placedNews}
            onDropNews={dropNews}
            onRemove={handleRemovePlaced}
          />
        </div>
      </div>

      {modalResult && (
        <MetricsModal result={modalResult} onClose={handleModalClose} />
      )}

      {showJournalistsModal && (
        <JournalistsModal
          staff={journalists}
          available={AVAILABLE_JOURNALISTS}
          onHire={hireJournalist}
          onFire={fireJournalist}
          onClose={() => setShowJournalistsModal(false)}
        />
      )}
    </>
  );
}
