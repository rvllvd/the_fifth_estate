import { useEffect, useMemo, useState } from 'react';
import TopPanel from './components/TopPanel';
import LeftPanel from './components/LeftPanel';
import Newspaper from './components/Newspaper';
import MetricsModal from './components/MetricsModal';
import JournalistsModal from './components/JournalistsModal';
import type { GameState, Journalist, Metrics, NewsItem } from './types';
import { clearState, getInitialState, loadState, saveState } from './utils/storage';
import { playSound } from './utils/sounds';
import { getNewsById, getRandomNews } from './data/news';
import { AVAILABLE_JOURNALISTS } from './data/journalists';
import { useBackgroundMusic } from './hooks/useBackgroundMusic';
import {
  applyPublication,
  calculatePublicationResult,
  canPublish,
} from './utils/game_logic';

export default function App() {
  useBackgroundMusic('/assets/sounds/city-noise.mp3', 0.75);
  const [state, setState] = useState<GameState>(() => {
    const saved = loadState();
    if (saved) return saved;
    const init = getInitialState();
    init.journalists = AVAILABLE_JOURNALISTS.slice(0, 3);
    return init;
  });


  const [modalResult, setModalResult] = useState<Metrics | null>(null);
  const [showJournalistsModal, setShowJournalistsModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');



  // Первичная загрузка новостей и лог
  useEffect(() => {
    if (state.currentNewsIds.length === 0) {
      const randomNews = getRandomNews(10, state.usedNewsIds);
      setState((prev): GameState => ({
        ...prev,
        currentNewsIds: randomNews.map((n) => n.id),
        currentCategories: [...new Set(randomNews.map((n) => n.category))],
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Автосохранение
  useEffect(() => {
    saveState(state);
  }, [state]);

  
  useEffect(() => {
    const handler = () => {
      playSound('/assets/sounds/menu-button-click.mp3', 0.9);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // useEffect(() => {
  //   const handler = (e: MouseEvent) => {
  //     const target = e.target as HTMLElement;
  //     if (target.closest('.news-item, .staff-card, .action-btn')) {
  //       playSound('/assets/sounds/menu-button-click.mp3', 1);
  //     }
  //   };
  //   document.addEventListener('click', handler);
  //   return () => document.removeEventListener('click', handler);
  // }, []);

  useEffect(() => {
  if (state.currentNewsIds.length > 0) return;

  const randomNews = getRandomNews(10, state.usedNewsIds);
  if (randomNews.length === 0) return; // если все новости закончились

  setState((prev): GameState => ({
      ...prev,
      currentNewsIds: randomNews.map((n) => n.id),
      currentCategories: [...new Set(randomNews.map((n) => n.category))],
    }));
  }, [state.currentNewsIds, state.usedNewsIds]);

  const currentNews = useMemo<NewsItem[]>(() => {
    return state.currentNewsIds
      .map((id) => getNewsById(id))
      .filter((n): n is NewsItem => Boolean(n));
  }, [state.currentNewsIds]);

  const filteredNews = useMemo(() => {
    return activeCategory === 'all'
      ? currentNews
      : currentNews.filter((n) => n.category === activeCategory);
  }, [currentNews, activeCategory]);

  const placedNewsIds = useMemo(
    () => new Set(state.placedNews.map((p) => p.newsId)),
    [state.placedNews]
  );

  const handleNewGame = () => {
    clearState();
    const init = getInitialState();
    init.journalists = AVAILABLE_JOURNALISTS.slice(0, 3);
    setState(init);
    setActiveCategory('all');
  };



  const handleHireJournalist = (j: Journalist) => {
    setState((prev) => ({ ...prev, journalists: [...prev.journalists, j] }));
  };

  const handleFireJournalist = (id: string) => {
    setState((prev) => ({ ...prev, journalists: prev.journalists.filter((x) => x.id !== id) }));
  };

  const handleDropNews = (key: string, news: NewsItem) => {
    const [tierStr, slotStr] = key.split('-');
    const tier = Number(tierStr);
    const slot = Number(slotStr);

    // Если новость уже где-то стоит — убираем
    const filtered = state.placedNews.filter((p) => p.newsId !== news.id);
    setState((prev) => ({
      ...prev,
      placedNews: [...filtered, { newsId: news.id, tier, slot }],
    }));
  };

  const handleRemovePlaced = (newsId: string) => {
    setState((prev) => ({
      ...prev,
      placedNews: prev.placedNews.filter((p) => p.newsId !== newsId),
    }));
    playSound('/assets/sounds/newspaper_grab_pick_up_001_30856.mp3', 1);
  };

  const handleClearNewspaper = () => {
    setState((prev) => ({ ...prev, placedNews: [] }));
    playSound('/assets/sounds/clear.mp3', 1);
  };

  const handlePublish = () => {
    if (!canPublish(state)) {
      return;
    }
    const result = calculatePublicationResult(state.placedNews, state.journalists);
    setModalResult(result);
    playSound('/assets/sounds/newspaper.mp3', 1);
  };

  const handleModalClose = () => {
    if (!modalResult) return;
    const newState = applyPublication(state, modalResult);
    setState(newState);
    setModalResult(null);
  };

  const preview = useMemo(
    () => calculatePublicationResult(state.placedNews, state.journalists),
    [state.placedNews, state.journalists]
  );

  return (
    <>
      <div id="app">
        <TopPanel metrics={state} onNewGame={handleNewGame} preview={preview} />
        <div id="main-content">
          <LeftPanel
            news={filteredNews}
            placedNewsIds={placedNewsIds}
            canPublish={canPublish(state)}
            placedCount={state.placedNews.length}
            onPublish={handlePublish}
            onClear={handleClearNewspaper}
            staff={state.journalists}
            onOpenJournalists={() => setShowJournalistsModal(true)}
          />
          <Newspaper
            placedNews={state.placedNews}
            onDropNews={handleDropNews}
            onRemove={handleRemovePlaced}
          />
        </div>
      </div>

      {modalResult && <MetricsModal result={modalResult} onClose={handleModalClose} />}

      {showJournalistsModal && (
        <JournalistsModal
          staff={state.journalists}
          available={AVAILABLE_JOURNALISTS}
          onHire={handleHireJournalist}
          onFire={handleFireJournalist}
          onClose={() => setShowJournalistsModal(false)}
        />
      )}
    </>
  );
}