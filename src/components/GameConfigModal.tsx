import { useState } from "react";
import {
  getGlobalConfigSnapshot,
  resetGlobalConfig,
  saveGlobalConfig,
} from "../constants/global";

type ConfigValue =
  | string
  | number
  | boolean
  | ConfigValue[]
  | { [key: string]: ConfigValue };
type ConfigRecord = { [key: string]: ConfigValue };
type ConfigDraft = {
  metrics: ConfigRecord;
  game: ConfigRecord;
  news: ConfigRecord;
};

const CONFIG_LABELS: Record<string, string> = {
  metrics: "Основные метрики",
  game: "Игровой баланс",
  news: "Баланс новостей",
  influence: "Влияние",
  credibility: "Доверие",
  reputation: "Репутация",
  loyalty: "Лояльность",
  label: "Название метрики",
  icon: "Иконка",
  initial: "Начальное значение",
  min: "Минимальное значение",
  max: "Максимальное значение",
  maxTurns: "Максимум ходов",
  showGameTime: "Показывать игровое время",
  weeklyMoneyGoals: "Денежные цели по неделям",
  articlesPerPublication: "Новостей на выпуск",
  newsPerRoll: "Новостей при обновлении",
  initialJournalists: "Журналистов в начале",
  maximumJournalists: "Максимум сотрудников",
  money: "Деньги для победы",
  columns: "Колонки газеты",
  title: "Название",
  slots: "Количество мест",
  multiplier: "Множитель",
  initialReaders: "Читатели в начале",
  initialMoney: "Деньги в начале",
  minimumReaders: "Минимум читателей",
  minimumMoney: "Минимум денег",
  moneyPerReaderPerHour: "Доход с читателя за час",
  readerIncomeGrowth: "Рост дохода с аудиторией",
  readersPerMilestone: "Читателей на ступень дохода",
  incomePerReaderPerMilestone: "Добавка к доходу за читателя",
  journalistHourlyWages: "Почасовые ставки журналистов",
  journalistBonuses: "Параметры бонусов журналистов",
  sameCategorySynergy: "Синергия одной категории",
  morningEdition: "Утренний выпуск",
  eveningSports: "Вечерний спорт",
  weekendPremiere: "Премьера выходного дня",
  sensationalIncident: "Сенсационное происшествие",
  publicTrust: "Доверие общества",
  diverseNewsroom: "Разнообразие редакции",
  editorialTeamwork: "Командная работа",
  carefulSourcing: "Проверка источников",
  audienceRecovery: "Возвращение аудитории",
  marketAuthority: "Авторитет в экономике",
  startHour: "Начальный час",
  endHour: "Конечный час",
  days: "Дни недели",
  category: "Категория новости",
  categories: "Категории новостей",
  metricScale: "Масштаб бонуса",
  minimumCredibility: "Минимум доверия для бонуса",
  minimumCategories: "Минимум разных категорий",
  credibilityPerColleague: "Доверие за коллегу",
  maximumloyalty: "Максимум лояльности для бонуса",
  minimumInfluence: "Минимум влияния для бонуса",
  audienceChange: "Изменение аудитории",
  loyaltyEffect: "Влияние прироста лояльности",
  influenceEffect: "Влияние прироста влияния",
  credibilityEffect: "Влияние прироста доверия",
  reputationEffect: "Влияние прироста репутации",
  qualityEffect: "Влияние качества редакции",
  loyaltyLevelEffect: "Влияние уровня лояльности",
  loyaltyLevelScale: "Масштаб лояльности",
  editorialQualityBaseline: "Базовое качество редакции",
  loyaltyBaseline: "Базовый уровень лояльности",
  influenceQuality: "Вес влияния в качестве",
  credibilityQuality: "Вес доверия в качестве",
  reputationQuality: "Вес репутации в качестве",
  readershipGrowthEffect: "Ускорение роста аудитории",
  NEWS_EFFECT_BALANCE: "Баланс влияния новостей",
  newsEffectBalance: "Баланс влияния новостей",
  scale: "Масштаб исходного эффекта",
  offset: "Смещение эффекта",
  victoryThresholds: "Условия победы",
  gameStart: "Начало игрового времени",
  year: "Год",
  month: "Месяц (0–11)",
  day: "День месяца",
  firstWorkingHour: "Первый рабочий час",
  lastWorkingHour: "Последний рабочий час",
  publicationTimeAdvanceMinutes: "Продвижение времени за выпуск",
  autoPlay: "Автоигрок",
  actionDelayMs: "Задержка между ходами (мс)",
  resultDisplayMs: "Показ результата хода (мс)",
  randomness: "Случайность выбора",
  hireReserveTurns: "Денежный резерв для найма (ходов)",
  economySaveVersion: "Версия формата сохранения (только чтение)",
};

function isRecord(value: ConfigValue): value is ConfigRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function updateAtPath(
  record: ConfigRecord,
  path: string[],
  value: ConfigValue,
): ConfigRecord {
  const [key, ...remaining] = path;
  if (!key) return record;

  const current = record[key];
  return {
    ...record,
    [key]:
      remaining.length > 0 && isRecord(current)
        ? updateAtPath(current, remaining, value)
        : value,
  };
}

function getFieldLabel(key: string, path: string[]): string {
  if (path[0] === "game" && path[1] === "columns" && path.length === 3) {
    const title = CONFIG_LABELS[key] ?? key;
    return `${title} (колонка ${key})`;
  }
  return (
    CONFIG_LABELS[key] ??
    key
      .replace(/_/g, " ")
      .replace(/[A-Z]/g, (letter) => ` ${letter}`)
      .toLowerCase()
  );
}

interface ConfigFieldsProps {
  value: ConfigRecord;
  path: string[];
  onChange: (path: string[], value: ConfigValue) => void;
}

function ConfigFields({ value, path, onChange }: ConfigFieldsProps) {
  return (
    <>
      {Object.entries(value).map(([key, fieldValue]) => {
        const fieldPath = [...path, key];
        const label = getFieldLabel(key, fieldPath);

        if (isRecord(fieldValue)) {
          return (
            <fieldset className="game-config-group" key={fieldPath.join(".")}>
              <legend>{label}</legend>
              <ConfigFields
                value={fieldValue}
                path={fieldPath}
                onChange={onChange}
              />
            </fieldset>
          );
        }

        if (Array.isArray(fieldValue)) {
          const numeric = typeof fieldValue[0] === "number";
          return (
            <label className="game-config-field" key={fieldPath.join(".")}>
              <span>{label}</span>
              <input
                type="text"
                value={fieldValue.join(", ")}
                onChange={(event) => {
                  const items = event.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean);
                  const parsed = numeric
                    ? items.map(Number).filter(Number.isFinite)
                    : items;
                  onChange(fieldPath, parsed);
                }}
              />
            </label>
          );
        }

        if (key === "economySaveVersion") {
          return (
            <div className="game-config-readonly" key={fieldPath.join(".")}>
              <span>{label}</span>
              <strong>{String(fieldValue)}</strong>
            </div>
          );
        }

        return (
          <label className="game-config-field" key={fieldPath.join(".")}>
            <span>{label}</span>
            {typeof fieldValue === "boolean" ? (
              <input
                type="checkbox"
                checked={fieldValue}
                onChange={(event) =>
                  onChange(fieldPath, event.target.checked)
                }
              />
            ) : typeof fieldValue === "number" ? (
              <input
                type="number"
                step="any"
                value={fieldValue}
                onChange={(event) => {
                  const nextValue = Number(event.target.value);
                  if (Number.isFinite(nextValue)) onChange(fieldPath, nextValue);
                }}
              />
            ) : (
              <input
                type="text"
                value={String(fieldValue)}
                onChange={(event) => onChange(fieldPath, event.target.value)}
              />
            )}
          </label>
        );
      })}
    </>
  );
}

function validateConfig(draft: ConfigDraft): string | null {
  const metrics = draft.metrics;
  for (const key of ["influence", "credibility", "reputation", "loyalty"]) {
    const metric = metrics[key];
    if (!isRecord(metric)) return `Не найдены настройки метрики «${key}».`;
    if (
      typeof metric.min !== "number" ||
      typeof metric.max !== "number" ||
      metric.min >= metric.max
    ) {
      return `Минимум метрики «${key}» должен быть меньше максимума.`;
    }
    if (
      typeof metric.initial !== "number" ||
      metric.initial < metric.min ||
      metric.initial > metric.max
    ) {
      return `Начальное значение метрики «${key}» должно быть между минимумом и максимумом.`;
    }
  }

  const game = draft.game;
  const weeklyGoals = game.weeklyMoneyGoals;
  if (
    !Array.isArray(weeklyGoals) ||
    weeklyGoals.length === 0 ||
    weeklyGoals.some((goal, index) => {
      const previousGoal = weeklyGoals[index - 1];
      return (
        typeof goal !== "number" ||
        !Number.isFinite(goal) ||
        goal <= 0 ||
        (index > 0 &&
          typeof previousGoal === "number" &&
          goal <= previousGoal)
      );
    })
  ) {
    return "Недельные денежные цели должны положительно и строго возрастать.";
  }
  if (
    typeof game.maxTurns !== "number" ||
    game.maxTurns !== weeklyGoals.length * 7
  ) {
    return "Максимум ходов должен совпадать с числом недельных целей × 7.";
  }

  const timeAdvance = game.publicationTimeAdvanceMinutes;
  if (
    !isRecord(timeAdvance) ||
    typeof timeAdvance.min !== "number" ||
    typeof timeAdvance.max !== "number" ||
    timeAdvance.min < 0 ||
    timeAdvance.min > timeAdvance.max
  ) {
    return "Проверьте минимальное и максимальное продвижение времени.";
  }

  return null;
}

export default function GameConfigModal({ onClose }: { onClose: () => void }) {
  const [draft, setDraft] = useState<ConfigDraft>(() =>
    JSON.parse(JSON.stringify(getGlobalConfigSnapshot())) as ConfigDraft,
  );
  const [error, setError] = useState("");

  const updateConfig = (path: string[], value: ConfigValue) => {
    const [section, ...fieldPath] = path;
    if (section !== "metrics" && section !== "game" && section !== "news") {
      return;
    }
    setDraft((current) => ({
      ...current,
      [section]: updateAtPath(current[section], fieldPath, value),
    }));
    setError("");
  };

  const applyConfig = () => {
    const validationError = validateConfig(draft);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      saveGlobalConfig(draft);
      window.location.reload();
    } catch (saveError) {
      console.error("Не удалось сохранить настройки баланса игры:", saveError);
      setError("Не удалось сохранить настройки. Проверьте доступность хранилища браузера.");
    }
  };

  const resetConfig = () => {
    try {
      resetGlobalConfig();
      window.location.reload();
    } catch (resetError) {
      console.error("Не удалось сбросить настройки баланса игры:", resetError);
      setError("Не удалось сбросить настройки. Проверьте доступность хранилища браузера.");
    }
  };

  return (
    <div
      className="modal show game-config-modal"
      role="presentation"
      onClick={onClose}
    >
      <section
        className="modal-content game-config-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-config-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-header game-config-header">
          <h2 id="game-config-title">Настройка игры</h2>
          <button
            className="close-modal-btn"
            type="button"
            onClick={onClose}
            aria-label="Закрыть настройки игры"
          >
            ×
          </button>
        </header>
        <p className="game-config-notice">
          Изменения сохранятся в этом браузере и применятся после перезагрузки.
          Текущее сохранение игры останется нетронутым.
        </p>
        <div className="game-config-sections">
          <fieldset className="game-config-group">
            <legend>Основные метрики</legend>
            <ConfigFields
              value={draft.metrics}
              path={["metrics"]}
              onChange={updateConfig}
            />
          </fieldset>
          <fieldset className="game-config-group">
            <legend>Игровой баланс</legend>
            <ConfigFields
              value={draft.game}
              path={["game"]}
              onChange={updateConfig}
            />
          </fieldset>
          <fieldset className="game-config-group">
            <legend>Баланс новостей</legend>
            <ConfigFields
              value={draft.news}
              path={["news"]}
              onChange={updateConfig}
            />
          </fieldset>
        </div>
        {error && (
          <p className="game-config-error" role="alert">
            {error}
          </p>
        )}
        <footer className="game-config-actions">
          <button
            className="right-btn game-config-reset"
            type="button"
            onClick={resetConfig}
          >
            Сбросить настройки
          </button>
          <button className="right-btn" type="button" onClick={applyConfig}>
            Сохранить и применить
          </button>
        </footer>
      </section>
    </div>
  );
}
