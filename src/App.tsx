import { useEffect, useMemo, useState } from "react";
import "./styles/themes/dark.css"; // import dark theme overrides
import "./styles/themes/vanilla.css"; // import vanilla theme (original)
import TopPanel from "./components/TopPanel";
import LeftPanel from "./components/LeftPanel";
import Newspaper from "./components/Newspaper";
import MetricsModal from "./components/MetricsModal";
import JournalistsModal from "./components/JournalistsModal";
import AlertModal from "./components/AlertModal";
import type { GameState, Metrics, NewsItem, PlacedNews } from "./types";
import { playSound } from "./utils/sounds";
import { getNewsById } from "./data/news";
import { AVAILABLE_JOURNALISTS } from "./data/journalists";
import { useBackgroundMusic } from "./hooks/useBackgroundMusic";
import { calculatePublicationResult } from "./utils/game";
import { useGameStore, selectCanPublish } from "./store/gameStore";
import SettingsModal from "./components/SettingsModal";
import { getDefeatDescriptions } from "./constants/stats";
import StatisticsModal from "./components/StatisticsModal";
import { setSoundEffectsSettings } from "./utils/sounds";

export default function App() {
  const [modalResult, setModalResult] = useState<Metrics | null>(null);
  const [publicationPreview, setPublicationPreview] = useState<{
    result: Metrics;
    placedNews: PlacedNews[];
    gameState: GameState;
    animationDuration: number;
  } | null>(null);
  const [showJournalistsModal, setShowJournalistsModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showStatisticsModal, setShowStatisticsModal] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(
    () => localStorage.getItem("backgroundMusicEnabled") !== "false",
  );
  const [musicVolume, setMusicVolume] = useState(() => {
    const stored = Number(localStorage.getItem("backgroundMusicVolume"));
    return Number.isFinite(stored) && localStorage.getItem("backgroundMusicVolume") !== null
      ? Math.max(0, Math.min(1, stored))
      : 0.75;
  });
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(
    () => localStorage.getItem("soundEffectsEnabled") !== "false",
  );
  const [soundEffectsVolume, setSoundEffectsVolume] = useState(() => {
    const stored = Number(localStorage.getItem("soundEffectsVolume"));
    return Number.isFinite(stored) && localStorage.getItem("soundEffectsVolume") !== null
      ? Math.max(0, Math.min(1, stored))
      : 1;
  });
  const [animationEnabled, setAnimationEnabled] = useState(
    () => localStorage.getItem("animationEnabled") !== "false",
  );

  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark";
  });

  useBackgroundMusic(
    "/assets/sounds/city-noise.mp3",
    musicVolume,
    musicEnabled,
  );

  const openSettings = () => setShowSettingsModal(true);
  const closeSettings = () => setShowSettingsModal(false);

  useEffect(() => {
    setSoundEffectsSettings(soundEffectsEnabled, soundEffectsVolume);
    localStorage.setItem("soundEffectsEnabled", String(soundEffectsEnabled));
    localStorage.setItem("soundEffectsVolume", String(soundEffectsVolume));
  }, [soundEffectsEnabled, soundEffectsVolume]);

  // toggle theme handler
  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  // apply theme class to body and save to localStorage
  useEffect(() => {
    if (isDark) {
      document.body.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    document.body.classList.toggle("animations-disabled", !animationEnabled);
    localStorage.setItem("animationEnabled", String(animationEnabled));
  }, [animationEnabled]);

  // читаем
  //   // const turn = useGameStore((s) => s.turn);
  const influence = useGameStore((s) => s.influence);
  const gameTime = useGameStore((s) => s.gameTime);
  const credibility = useGameStore((s) => s.credibility);
  const reputation = useGameStore((s) => s.reputation);
  const readership = useGameStore((s) => s.readership);
  const currentNewsIds = useGameStore((s) => s.currentNewsIds);
  const usedNewsIds = useGameStore((s) => s.usedNewsIds);
  const placedNews = useGameStore((s) => s.placedNews);
  const journalists = useGameStore((s) => s.journalists);
  const publicationHistory = useGameStore((s) => s.publicationHistory);
  const canPublishNow = useGameStore(selectCanPublish);
  const gameState = useGameStore((state) => state);

  // экшены
  const rollCurrentNews = useGameStore((s) => s.rollCurrentNews);
  const isGameOver = useGameStore((s) => s.isGameOver);
  const dropNews = useGameStore((s) => s.dropNews);
  const removePlaced = useGameStore((s) => s.removePlaced);
  const clearNewspaper = useGameStore((s) => s.clearNewspaper);
  const hireJournalist = useGameStore((s) => s.hireJournalist);
  const fireJournalist = useGameStore((s) => s.fireJournalist);
  const publishStore = useGameStore((s) => s.publish);
  const applyResult = useGameStore((s) => s.applyResult);
  const newGame = useGameStore((s) => s.newGame);
  const tickGameTime = useGameStore((s) => s.tickGameTime);

  useEffect(() => {
    tickGameTime();
    const intervalId = window.setInterval(tickGameTime, 1000);
    return () => window.clearInterval(intervalId);
  }, [tickGameTime]);

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

  useEffect(() => {
    if (isGameOver()) setShowAlertModal(true);
  });

  useEffect(() => {
    if (!publicationPreview) return;
    const timeoutId = window.setTimeout(() => {
      setModalResult(publicationPreview.result);
      setPublicationPreview(null);
    }, publicationPreview.animationDuration);
    return () => window.clearTimeout(timeoutId);
  }, [publicationPreview]);

  const currentNews = useMemo<NewsItem[]>(
    () =>
      currentNewsIds
        .map((id) => getNewsById(id))
        .filter((n): n is NewsItem => Boolean(n)),
    [currentNewsIds],
  );

  const placedNewsIds = useMemo(
    () => new Set(placedNews.map((p) => p.newsId)),
    [placedNews],
  );

  const preview = useMemo(
    () => calculatePublicationResult(placedNews, journalists, gameState),
    [placedNews, journalists, gameState],
  );

  const handleNewGame = () => {
    if (window.confirm("Начать новую игру? Текущий прогресс будет потерян.")) {
      newGame();
    }
  };

  const toggleAnimation = () => setAnimationEnabled((enabled) => !enabled);

  const toggleMusic = () => {
    setMusicEnabled((enabled) => {
      const next = !enabled;
      localStorage.setItem("backgroundMusicEnabled", String(next));
      return next;
    });
  };

  const updateMusicVolume = (volume: number) => {
    setMusicVolume(volume);
    localStorage.setItem("backgroundMusicVolume", String(volume));
  };

  const toggleSoundEffects = () => {
    setSoundEffectsEnabled((enabled) => {
      const next = !enabled;
      setSoundEffectsSettings(next, soundEffectsVolume);
      localStorage.setItem("soundEffectsEnabled", String(next));
      return next;
    });
  };

  const updateSoundEffectsVolume = (volume: number) => {
    setSoundEffectsVolume(volume);
    setSoundEffectsSettings(soundEffectsEnabled, volume);
    localStorage.setItem("soundEffectsVolume", String(volume));
  };

  const resetSettings = () => {
    setMusicEnabled(true);
    setMusicVolume(0.75);
    setSoundEffectsEnabled(true);
    setSoundEffectsVolume(1);
    setAnimationEnabled(true);
    setIsDark(false);
    localStorage.setItem("backgroundMusicEnabled", "true");
    localStorage.setItem("backgroundMusicVolume", "0.75");
    localStorage.setItem("soundEffectsEnabled", "true");
    localStorage.setItem("soundEffectsVolume", "1");
    localStorage.setItem("animationEnabled", "true");
    localStorage.setItem("theme", "light");
    document.body.classList.remove("animations-disabled", "dark-theme");
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
    const printedNews = placedNews.map((item) => ({ ...item }));
    const printedGameState = {
      ...gameState,
      journalists: [...gameState.journalists],
    };
    const result = publishStore();
    if (!result) return;
    const animationDuration = animationEnabled ? 1200 : 0;
    setPublicationPreview({
      result,
      placedNews: printedNews,
      gameState: printedGameState,
      animationDuration,
    });
    playSound("/assets/sounds/newspaper.mp3", 1);
  };

  const handleModalClose = () => {
    if (!modalResult) return;
    applyResult(modalResult);
    setModalResult(null);
  };

  return (
    <>
      <div className="particles" id="particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>
      <div id="app">
        <TopPanel
          metrics={{ influence, credibility, reputation, readership }}
          gameTime={gameTime}
          onNewGame={handleNewGame}
          preview={preview}
          onOpenStatistics={() => setShowStatisticsModal(true)}
          onOpenSettings={openSettings}
        />
        <div id="main-content">
          <LeftPanel
            news={currentNews}
            placedNewsIds={placedNewsIds}
            canPublish={canPublishNow}
            placedCount={placedNews.length}
            onPublish={handlePublish}
            onClear={handleClearNewspaper}
            staff={journalists}
            gameState={gameState}
            onOpenJournalists={() => setShowJournalistsModal(true)}
          />
          <Newspaper
            placedNews={publicationPreview?.placedNews ?? placedNews}
            gameState={publicationPreview?.gameState ?? gameState}
            isPublishing={Boolean(publicationPreview && animationEnabled)}
            onDropNews={dropNews}
            onRemove={handleRemovePlaced}
          />
        </div>
      </div>

      {modalResult && (
        <MetricsModal
          result={modalResult}
          contributions={
            publicationHistory[publicationHistory.length - 1]?.news ?? []
          }
          onClose={handleModalClose}
        />
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

      {showSettingsModal && (
        <SettingsModal
          visible={showSettingsModal}
          onClose={closeSettings}
          onToggleTheme={toggleTheme}
          animationEnabled={animationEnabled}
          onToggleAnimation={toggleAnimation}
          musicEnabled={musicEnabled}
          musicVolume={musicVolume}
          onToggleMusic={toggleMusic}
          onMusicVolumeChange={updateMusicVolume}
          soundEffectsEnabled={soundEffectsEnabled}
          soundEffectsVolume={soundEffectsVolume}
          onToggleSoundEffects={toggleSoundEffects}
          onSoundEffectsVolumeChange={updateSoundEffectsVolume}
          onResetSettings={resetSettings}
        />
      )}

      {showStatisticsModal && (
        <StatisticsModal
          history={publicationHistory}
          onClose={() => setShowStatisticsModal(false)}
        />
      )}

      {showAlertModal && (
        <AlertModal
          text="Вы проиграли"
          descriptions={getDefeatDescriptions({
            influence,
            credibility,
            reputation,
            readership,
          })}
          onClose={() => setShowAlertModal(false)}
          onNewGame={handleNewGame}
        />
      )}
    </>
  );
}
