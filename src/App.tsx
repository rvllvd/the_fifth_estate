import { useCallback, useEffect, useMemo, useState } from "react";
import "./styles/themes/dark.scss";
import "./styles/themes/cyberpunk.scss";
import "./styles/themes/vanilla.scss"; // import vanilla theme (original)
import "./styles/gamepad.scss";
import TopPanel from "./components/TopPanel";
import LeftPanel from "./components/LeftPanel";
import Newspaper from "./components/Newspaper";
import MetricsModal from "./components/MetricsModal";
import JournalistsModal from "./components/JournalistsModal";
import AlertModal from "./components/AlertModal";
import type { GameState, Metrics, NewsItem, PlacedNews, Theme } from "./types";
import { playSound } from "./utils/sounds";
import { getNewsById } from "./data/news";
import { AVAILABLE_JOURNALISTS } from "./data/journalists";
import { useBackgroundMusic } from "./hooks/useBackgroundMusic";
import { calculatePublicationResult } from "./utils/game";
import { chooseAutoTurn } from "./utils/autoPlayer";
import {
  useGameStore,
  selectCanPublish,
  selectIsVictory,
} from "./store/gameStore";
import SettingsModal from "./components/SettingsModal";
import { getDefeatDescriptions } from "./constants/stats";
import StatisticsModal from "./components/StatisticsModal";
import GameConfigModal from "./components/GameConfigModal";
import GameMenuModal from "./components/GameMenuModal";
import GameEventModal from "./components/GameEventModal";
import { setSoundEffectsSettings } from "./utils/sounds";
import { getEconomyDefeatDescriptions } from "./constants/economy";
import { getCurrentPayroll, settleEconomy } from "./utils/economy";
import { GAME_BALANCE } from "./constants/global";
import { useGamepadControls } from "./hooks/useGamepadControls";
import { GAME_EVENTS } from "./data/events";

export default function App() {
  const gamepadConnected = useGamepadControls();
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
  const [showGameMenuModal, setShowGameMenuModal] = useState(false);
  const [showGameConfigModal, setShowGameConfigModal] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);
  const [autoPlayStep, setAutoPlayStep] = useState(0);
  const [autoPlayMessage, setAutoPlayMessage] = useState("");
  const [musicEnabled, setMusicEnabled] = useState(
    () => localStorage.getItem("backgroundMusicEnabled") !== "false",
  );
  const [musicVolume, setMusicVolume] = useState(() => {
    const stored = Number(localStorage.getItem("backgroundMusicVolume"));
    return Number.isFinite(stored) &&
      localStorage.getItem("backgroundMusicVolume") !== null
      ? Math.max(0, Math.min(1, stored))
      : 0.75;
  });
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(
    () => localStorage.getItem("soundEffectsEnabled") !== "false",
  );
  const [soundEffectsVolume, setSoundEffectsVolume] = useState(() => {
    const stored = Number(localStorage.getItem("soundEffectsVolume"));
    return Number.isFinite(stored) &&
      localStorage.getItem("soundEffectsVolume") !== null
      ? Math.max(0, Math.min(1, stored))
      : 1;
  });
  const [animationEnabled, setAnimationEnabled] = useState(
    () => localStorage.getItem("animationEnabled") !== "false",
  );

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark" || saved === "cyberpunk" ? saved : "light";
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

  // Apply and persist the selected theme.
  useEffect(() => {
    document.body.classList.toggle("dark-theme", theme === "dark");
    document.body.classList.toggle("cyberpunk-theme", theme === "cyberpunk");
    localStorage.setItem("theme", theme);
  }, [theme]);

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
  const loyalty = useGameStore((s) => s.loyalty);
  const currentNewsIds = useGameStore((s) => s.currentNewsIds);
  const usedNewsIds = useGameStore((s) => s.usedNewsIds);
  const placedNews = useGameStore((s) => s.placedNews);
  const journalists = useGameStore((s) => s.journalists);
  const publicationHistory = useGameStore((s) => s.publicationHistory);
  const canPublishNow = useGameStore(selectCanPublish);
  const gameWon = useGameStore(selectIsVictory);
  const gameState = useGameStore((state) => state);
  const weekResult = gameState.weekResult;
  const pendingEvent = gameState.pendingEvent;
  const currentEvent = pendingEvent
    ? GAME_EVENTS.find((event) => event.id === pendingEvent.id)
    : undefined;
  const weeklyGoal =
    GAME_BALANCE.weeklyMoneyGoals[
      Math.min(
        Math.floor((gameState.turn - 1) / 7),
        GAME_BALANCE.weeklyMoneyGoals.length - 1,
      )
    ];

  // экшены
  const rollCurrentNews = useGameStore((s) => s.rollCurrentNews);
  const isGameOver = useGameStore((s) => s.isGameOver);
  const dropNews = useGameStore((s) => s.dropNews);
  const removePlaced = useGameStore((s) => s.removePlaced);
  const clearNewspaper = useGameStore((s) => s.clearNewspaper);
  const hireJournalist = useGameStore((s) => s.hireJournalist);
  const fireJournalist = useGameStore((s) => s.fireJournalist);
  const applyResult = useGameStore((s) => s.applyResult);
  const resolveEvent = useGameStore((s) => s.resolveEvent);
  const dismissWeekResult = useGameStore((s) => s.dismissWeekResult);
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
  const economyPreview = useMemo(
    () => (canPublishNow ? settleEconomy(gameState, preview) : null),
    [canPublishNow, gameState, preview],
  );

  const handleNewGame = () => {
    if (window.confirm("Начать новую игру? Текущий прогресс будет потерян.")) {
      setAutoPlayEnabled(false);
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
    setTheme("light");
    localStorage.setItem("backgroundMusicEnabled", "true");
    localStorage.setItem("backgroundMusicVolume", "0.75");
    localStorage.setItem("soundEffectsEnabled", "true");
    localStorage.setItem("soundEffectsVolume", "1");
    localStorage.setItem("animationEnabled", "true");
    localStorage.setItem("theme", "light");
    document.body.classList.remove(
      "animations-disabled",
      "dark-theme",
      "cyberpunk-theme",
    );
  };

  const handleRemovePlaced = (newsId: string) => {
    removePlaced(newsId);
    playSound("/assets/sounds/newspaper_grab_pick_up_001_30856.mp3", 1);
  };

  const handleClearNewspaper = () => {
    clearNewspaper();
    playSound("/assets/sounds/clear.mp3", 1);
  };

  const handlePublish = useCallback(() => {
    const currentState = useGameStore.getState();
    const printedNews = currentState.placedNews.map((item) => ({ ...item }));
    const printedGameState = {
      ...currentState,
      journalists: [...currentState.journalists],
    };
    const result = currentState.publish();
    if (!result) return;
    const animationDuration = animationEnabled ? 1200 : 0;
    setPublicationPreview({
      result,
      placedNews: printedNews,
      gameState: printedGameState,
      animationDuration,
    });
    playSound("/assets/sounds/newspaper.mp3", 1);
  }, [animationEnabled]);

  const runAutoTurn = useCallback(() => {
    const initialState = useGameStore.getState();
    if (initialState.isGameOver()) {
      setAutoPlayEnabled(false);
      return;
    }

    const availableNews = initialState.currentNewsIds
      .map((id) => getNewsById(id))
      .filter((item): item is NewsItem => Boolean(item));
    if (availableNews.length === 0) {
      initialState.rollCurrentNews(true);
      setAutoPlayMessage("ИИ подбирает новую подборку новостей.");
      setAutoPlayStep((step) => step + 1);
      return;
    }

    let plan = chooseAutoTurn(
      initialState,
      availableNews,
      AVAILABLE_JOURNALISTS,
    );
    if (
      plan.journalistToHire &&
      !initialState.hireJournalist(plan.journalistToHire)
    ) {
      plan = chooseAutoTurn(useGameStore.getState(), availableNews, []);
    }

    const originalNewsIds = new Set(
      initialState.placedNews.map((placed) => placed.newsId),
    );
    const store = useGameStore.getState();
    for (const choice of plan.placements) {
      const hasAssignedJournalist = Boolean(choice.journalistId);
      if (
        !store.dropNews(
          choice.slot,
          choice.news,
          hasAssignedJournalist ? choice.journalistId : undefined,
          !hasAssignedJournalist,
        )
      ) {
        const currentState = useGameStore.getState();
        for (const placed of currentState.placedNews) {
          if (!originalNewsIds.has(placed.newsId)) {
            currentState.removePlaced(placed.newsId);
          }
        }
        currentState.discardCurrentNews();
        setAutoPlayMessage("ИИ пробует другую подборку новостей.");
        setAutoPlayStep((step) => step + 1);
        return;
      }
    }

    const completedState = useGameStore.getState();
    if (
      completedState.placedNews.length >= GAME_BALANCE.articlesPerPublication
    ) {
      handlePublish();
      return;
    }

    if (completedState.placedNews.length > 0) {
      setAutoPlayMessage(
        `ИИ добирает новости: ${completedState.placedNews.length} из ${GAME_BALANCE.articlesPerPublication}.`,
      );
      completedState.discardCurrentNews();
      setAutoPlayStep((step) => step + 1);
      return;
    }

    completedState.discardCurrentNews();
    setAutoPlayMessage("ИИ пробует другую подборку новостей.");
    setAutoPlayStep((step) => step + 1);
  }, [handlePublish]);

  const toggleAutoPlay = () => {
    setAutoPlayMessage("");
    setAutoPlayEnabled((enabled) => !enabled);
  };

  useEffect(() => {
    if (!import.meta.env.DEV || !autoPlayEnabled) return;

    if (modalResult) {
      const timeoutId = window.setTimeout(
        () => {
          applyResult(modalResult);
          setModalResult(null);
        },
        Math.max(400, GAME_BALANCE.autoPlay.resultDisplayMs),
      );
      return () => window.clearTimeout(timeoutId);
    }

    if (publicationPreview) return;
    if (
      showJournalistsModal ||
      showGameMenuModal ||
      showSettingsModal ||
      showStatisticsModal ||
      showGameConfigModal ||
      weekResult ||
      pendingEvent
    ) {
      return;
    }
    if (showAlertModal || useGameStore.getState().isGameOver()) {
      setAutoPlayEnabled(false);
      return;
    }

    const timeoutId = window.setTimeout(
      runAutoTurn,
      Math.max(300, GAME_BALANCE.autoPlay.actionDelayMs),
    );
    return () => window.clearTimeout(timeoutId);
  }, [
    autoPlayEnabled,
    autoPlayStep,
    applyResult,
    modalResult,
    publicationPreview,
    runAutoTurn,
    showAlertModal,
    weekResult,
    pendingEvent,
    showGameMenuModal,
    showGameConfigModal,
    showJournalistsModal,
    showSettingsModal,
    showStatisticsModal,
  ]);

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
          metrics={{ influence, credibility, reputation, loyalty: loyalty }}
          preview={preview}
          gameTime={gameTime}
          turn={gameState.turn}
          readers={gameState.readers}
          money={gameState.money}
          onOpenMenu={() => setShowGameMenuModal(true)}
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
            showDeveloperTools={import.meta.env.DEV}
            autoPlayEnabled={autoPlayEnabled}
            autoPlayMessage={autoPlayMessage}
            onToggleAutoPlay={toggleAutoPlay}
          />
          <Newspaper
            placedNews={publicationPreview?.placedNews ?? placedNews}
            gameState={publicationPreview?.gameState ?? gameState}
            isPublishing={Boolean(
              publicationPreview &&
              publicationPreview.animationDuration > 0 &&
              animationEnabled,
            )}
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
          money={gameState.money}
          available={AVAILABLE_JOURNALISTS}
          onHire={hireJournalist}
          onFire={fireJournalist}
          onClose={() => setShowJournalistsModal(false)}
        />
      )}

      {showGameMenuModal && (
        <GameMenuModal
          readers={gameState.readers}
          money={gameState.money}
          weeklyGoal={weeklyGoal}
          payroll={getCurrentPayroll(journalists)}
          preview={preview}
          readerChangePreview={economyPreview?.readerChange ?? null}
          moneyChangePreview={economyPreview?.moneyChange ?? null}
          showDeveloperTools={import.meta.env.DEV}
          onClose={() => setShowGameMenuModal(false)}
          onNewGame={handleNewGame}
          onOpenSettings={openSettings}
          onOpenStatistics={() => setShowStatisticsModal(true)}
          onOpenGameConfig={() => setShowGameConfigModal(true)}
        />
      )}

      {pendingEvent &&
        currentEvent &&
        !modalResult &&
        !publicationPreview &&
        !showAlertModal &&
        !weekResult && (
          <GameEventModal
            event={currentEvent}
            turn={pendingEvent.turn}
            money={gameState.money}
            minimumMoney={GAME_BALANCE.minimumMoney}
            onChoose={resolveEvent}
          />
        )}

      {showSettingsModal && (
        <SettingsModal
          visible={showSettingsModal}
          onClose={closeSettings}
          theme={theme}
          onThemeChange={setTheme}
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

      {import.meta.env.DEV && showGameConfigModal && (
        <GameConfigModal onClose={() => setShowGameConfigModal(false)} />
      )}

      {showAlertModal && (
        <AlertModal
          text={gameWon ? "Газета победила!" : "Вы проиграли"}
          descriptions={
            gameWon
              ? [
                  `Редакция достигла цели — $${new Intl.NumberFormat("ru-RU").format(gameState.money)}. Вы построили успешное издание!`,
                ]
              : getDefeatDescriptions({
                  influence,
                  credibility,
                  reputation,
                  loyalty,
                })
                  .concat(
                    weekResult && !weekResult.passed
                      ? [
                          `Денежная цель недели ${weekResult.week} не выполнена: $${new Intl.NumberFormat("ru-RU").format(weekResult.balance)} из требуемых $${new Intl.NumberFormat("ru-RU").format(weekResult.target)}.`,
                        ]
                      : [],
                  )
                  .concat(
                    getEconomyDefeatDescriptions(
                      gameState.readers,
                      gameState.money,
                    ),
                  )
          }
          onClose={() => setShowAlertModal(false)}
          onNewGame={handleNewGame}
        />
      )}
      {weekResult?.passed && !showAlertModal && (
        <AlertModal
          text={`Неделя ${weekResult.week} пройдена`}
          descriptions={[
            `В редакционной кассе $${new Intl.NumberFormat("ru-RU").format(weekResult.balance)} при цели $${new Intl.NumberFormat("ru-RU").format(weekResult.target)}.`,
          ]}
          onClose={dismissWeekResult}
          onNewGame={handleNewGame}
          continueLabel="Продолжить"
        />
      )}
      {gamepadConnected && (
        <div className="gamepad-hint" role="status" aria-live="polite">
          🎮 Крестовина — навигация · A — выбрать · B — назад · X — очистить · Y
          — опубликовать
        </div>
      )}
    </>
  );
}
