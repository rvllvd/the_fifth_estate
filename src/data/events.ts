import {
  GAME_BALANCE,
  METRIC_DEFINITIONS,
  METRIC_KEYS,
} from "../constants/global";
import type { GameState, Metrics } from "../types";

export type GameEventPolarity = "supportive" | "setback";

export interface GameEventEffect {
  metrics?: Partial<
    Record<keyof Metrics, { amount: number; mode?: "flat" | "percent" }>
  >;
  money?: { amount: number; mode?: "flat" | "percent" };
}

export interface GameEventChoice {
  id: string;
  label: string;
  description?: string;
  cost?: number;
  effect?: GameEventEffect;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  polarity: GameEventPolarity;
  weight: number;
  condition: (state: GameState) => boolean;
  choices: GameEventChoice[];
}

export interface PendingGameEvent {
  id: string;
  turn: number;
}

type DirectorMode = "supportive" | "balanced" | "pressure";

export const GAME_EVENTS: GameEvent[] = [
  {
    id: "pie_outreach",
    title: "Пирожковая дипломатия",
    description:
      "Читатели всё реже возвращаются к газете. Редакционный отдел предлагает тёплую акцию у входа в типографию.",
    polarity: "supportive",
    weight: 1.2,
    condition: (state) => state.loyalty <= 8 && state.money > 250,
    choices: [
      {
        id: "host",
        label: "Раздать пирожки · $250",
        description: "Лояльность +8, репутация +3",
        cost: 250,
        effect: {
          metrics: {
            loyalty: { amount: 8 },
            reputation: { amount: 3 },
          },
        },
      },
      { id: "decline", label: "Отказаться" },
    ],
  },
  {
    id: "reader_letters",
    title: "Письма на первой полосе",
    description:
      "В редакцию пришли истории людей, которым давно не хватало внимания. Публикация подборки может вернуть доверие.",
    polarity: "supportive",
    weight: 1,
    condition: (state) => state.reputation <= 12,
    choices: [
      {
        id: "publish",
        label: "Дать читателям слово",
        description: "Репутация +7, доверие +3",
        effect: {
          metrics: {
            reputation: { amount: 7 },
            credibility: { amount: 3 },
          },
        },
      },
      { id: "decline", label: "Отложить публикацию" },
    ],
  },
  {
    id: "editorial_broadcast",
    title: "Голос редакции",
    description:
      "Небольшое открытое интервью помогает объяснить читателям, зачем газета берётся за сложные темы.",
    polarity: "supportive",
    weight: 1,
    condition: (state) => state.influence <= 12,
    choices: [
      {
        id: "broadcast",
        label: "Выйти в эфир",
        description: "Влияние +7, лояльность +3",
        effect: {
          metrics: {
            influence: { amount: 7 },
            loyalty: { amount: 3 },
          },
        },
      },
      { id: "decline", label: "Не сейчас" },
    ],
  },
  {
    id: "archive_review",
    title: "Архивная проверка",
    description:
      "Бывший редактор предлагает помочь перепроверить источники и восстановить доверие к материалам.",
    polarity: "supportive",
    weight: 0.9,
    condition: (state) => state.credibility <= 12,
    choices: [
      {
        id: "review",
        label: "Поднять архивы",
        description: "Доверие +7, репутация +2",
        effect: {
          metrics: {
            credibility: { amount: 7 },
            reputation: { amount: 2 },
          },
        },
      },
      { id: "decline", label: "Обойтись своими силами" },
    ],
  },
  {
    id: "readers_return",
    title: "Клуб постоянных читателей",
    description:
      "Несколько давних подписчиков готовы провести встречу с редакцией и рассказать, что им важно.",
    polarity: "supportive",
    weight: 0.8,
    condition: (state) => state.readers < 30 && state.loyalty < 15,
    choices: [
      {
        id: "meet",
        label: "Устроить встречу",
        description: "Лояльность +6, влияние +2",
        effect: {
          metrics: {
            loyalty: { amount: 6 },
            influence: { amount: 2 },
          },
        },
      },
      { id: "decline", label: "Пока не проводить" },
    ],
  },
  {
    id: "read_without_respect",
    title: "Вас читают, не уважая",
    description:
      "Газету обсуждают охотно, но тон редакции всё чаще считают легкомысленным. Критика ударяет по репутации.",
    polarity: "setback",
    weight: 1,
    condition: (state) => state.influence < 15 && state.loyalty > 20,
    choices: [
      {
        id: "accept",
        label: "Принять критику",
        description: "Репутация −20%",
        effect: { metrics: { reputation: { amount: -20, mode: "percent" } } },
      },
    ],
  },
  {
    id: "sources_questioned",
    title: "Источники под вопросом",
    description:
      "После громких публикаций коллеги требуют раскрыть, как редакция проверяет сведения. Доверие пошатнулось.",
    polarity: "setback",
    weight: 1,
    condition: (state) => state.credibility >= 22 && state.reputation >= 22,
    choices: [
      {
        id: "answer",
        label: "Выдержать проверку",
        description: "Доверие −15%",
        effect: { metrics: { credibility: { amount: -15, mode: "percent" } } },
      },
    ],
  },
  {
    id: "star_editor",
    title: "Звёздная болезнь",
    description:
      "Успех вскружил редакции голову: читатели замечают, что газета стала говорить свысока.",
    polarity: "setback",
    weight: 0.9,
    condition: (state) => state.influence >= 24 && state.loyalty >= 24,
    choices: [
      {
        id: "listen",
        label: "Услышать читателей",
        description: "Лояльность −15%",
        effect: { metrics: { loyalty: { amount: -15, mode: "percent" } } },
      },
    ],
  },
  {
    id: "advertiser_pressure",
    title: "Рекламодатели требуют скидку",
    description:
      "Увидев растущие доходы газеты, рекламодатели решили пересмотреть договоры в свою пользу.",
    polarity: "setback",
    weight: 0.8,
    condition: (state) => {
      const weekIndex = Math.min(
        Math.floor((state.turn - 1) / 7),
        GAME_BALANCE.weeklyMoneyGoals.length - 1,
      );
      return state.money > GAME_BALANCE.weeklyMoneyGoals[weekIndex] * 1.2;
    },
    choices: [
      {
        id: "negotiate",
        label: "Согласиться на пересмотр",
        description: "Деньги −8%",
        effect: { money: { amount: -8, mode: "percent" } },
      },
    ],
  },
  {
    id: "arrogant_editorial",
    title: "Уверенность приняли за высокомерие",
    description:
      "Редакционные колонки звучат всё громче, но читатели замечают, что газета перестала сомневаться в собственной правоте.",
    polarity: "setback",
    weight: 1.1,
    condition: (state) => state.influence >= 18 && state.reputation >= 17,
    choices: [
      {
        id: "reconsider",
        label: "Сбавить тон",
        description: "Репутация −14%",
        effect: { metrics: { reputation: { amount: -14, mode: "percent" } } },
      },
    ],
  },
  {
    id: "reader_fatigue",
    title: "Читательская усталость",
    description:
      "Постоянный поток громких материалов утомил аудиторию. Даже хорошие новости стали встречать без прежнего интереса.",
    polarity: "setback",
    weight: 1.1,
    condition: (state) => state.loyalty >= 17 && state.influence >= 16,
    choices: [
      {
        id: "slow_down",
        label: "Сделать паузу в сенсациях",
        description: "Лояльность −14%",
        effect: { metrics: { loyalty: { amount: -14, mode: "percent" } } },
      },
    ],
  },
  {
    id: "sponsor_leverage",
    title: "Рекламодатели почувствовали силу",
    description:
      "Успех издания привлёк крупных заказчиков. Вместе с рекламой пришли новые условия и скрытые требования.",
    polarity: "setback",
    weight: 1,
    condition: (state) => {
      const weekIndex = Math.min(
        Math.floor((state.turn - 1) / 7),
        GAME_BALANCE.weeklyMoneyGoals.length - 1,
      );
      return (
        state.money >= GAME_BALANCE.weeklyMoneyGoals[weekIndex] * 0.8 &&
        state.credibility >= 15
      );
    },
    choices: [
      {
        id: "sign_sponsor",
        label: "Принять условия",
        description: "Доверие −10%",
        effect: { metrics: { credibility: { amount: -10, mode: "percent" } } },
      },
    ],
  },
  {
    id: "paper_shortage",
    title: "Типография подняла цены",
    description:
      "Поставщик бумаги узнал о растущем тираже и пересмотрел контракт прямо перед печатью.",
    polarity: "setback",
    weight: 0.9,
    condition: (state) =>
      state.readers >= 100 || state.money >= GAME_BALANCE.initialMoney * 2,
    choices: [
      {
        id: "pay_supplier",
        label: "Оплатить срочную поставку",
        description: "Деньги −10%",
        effect: { money: { amount: -10, mode: "percent" } },
      },
    ],
  },
  {
    id: "headline_backlash",
    title: "Заголовок затмил материал",
    description:
      "Яркая подача привлекла внимание, но часть аудитории решила, что редакция пожертвовала точностью ради шума.",
    polarity: "setback",
    weight: 1,
    condition: (state) => state.influence >= 17 && state.loyalty >= 15,
    choices: [
      {
        id: "correct_course",
        label: "Вернуть контекст в центр",
        description: "Доверие −12%",
        effect: { metrics: { credibility: { amount: -12, mode: "percent" } } },
      },
    ],
  },
  {
    id: "competitor_campaign",
    title: "Конкуренты переманивают читателей",
    description:
      "Соседнее издание запустило громкую кампанию и обещает аудитории всё то же, только дешевле.",
    polarity: "setback",
    weight: 1,
    condition: (state) => state.readers >= 80 && state.reputation >= 16,
    choices: [
      {
        id: "hold_position",
        label: "Удерживать позицию",
        description: "Лояльность −12%, репутация −8%",
        effect: {
          metrics: {
            loyalty: { amount: -12, mode: "percent" },
            reputation: { amount: -8, mode: "percent" },
          },
        },
      },
    ],
  },
  {
    id: "community_factcheck",
    title: "Читатели помогают редакции",
    description:
      "Постоянные читатели прислали документы и готовы помочь редакции проверить спорный материал.",
    polarity: "supportive",
    weight: 0.9,
    condition: (state) => state.credibility <= 17 && state.loyalty >= 8,
    choices: [
      {
        id: "accept_help",
        label: "Принять помощь",
        description: "Доверие +5, репутация +2",
        effect: {
          metrics: {
            credibility: { amount: 5 },
            reputation: { amount: 2 },
          },
        },
      },
      { id: "decline", label: "Проверить материал самостоятельно" },
    ],
  },
  {
    id: "local_press_grant",
    title: "Городской грант для прессы",
    description:
      "Библиотека выделила небольшую поддержку независимому изданию, которое рассказывает о жизни города.",
    polarity: "supportive",
    weight: 0.8,
    condition: (state) => state.influence <= 17 && state.reputation <= 18,
    choices: [
      {
        id: "take_grant",
        label: "Принять поддержку",
        description: "Влияние +5, лояльность +2",
        effect: {
          metrics: {
            influence: { amount: 5 },
            loyalty: { amount: 2 },
          },
        },
      },
      { id: "decline", label: "Отказаться от гранта" },
    ],
  },
  {
    id: "clickbait_fatigue",
    title: "Сенсации приелись",
    description:
      "Читатели привыкли к громким заголовкам и всё чаще пролистывают материалы, не веря обещаниям первой строки.",
    polarity: "setback",
    weight: 1,
    condition: (state) => state.influence >= 15 && state.loyalty >= 14,
    choices: [
      {
        id: "change_tone",
        label: "Сменить тон подачи",
        description: "Влияние −10%",
        effect: { metrics: { influence: { amount: -10, mode: "percent" } } },
      },
    ],
  },
  {
    id: "correction_demand",
    title: "Требование опровержения",
    description:
      "Герой недавней публикации прислал документы и требует исправить неточность на видном месте.",
    polarity: "setback",
    weight: 1,
    condition: (state) => state.credibility >= 15 && state.reputation >= 15,
    choices: [
      {
        id: "publish_correction",
        label: "Опубликовать исправление",
        description: "Репутация −10%",
        effect: { metrics: { reputation: { amount: -10, mode: "percent" } } },
      },
    ],
  },
  {
    id: "subscription_slowdown",
    title: "Подписчики берут паузу",
    description:
      "После нескольких громких выпусков часть аудитории решила пропустить следующий номер.",
    polarity: "setback",
    weight: 1,
    condition: (state) => state.readers >= 35 && state.loyalty >= 13,
    choices: [
      {
        id: "retain_subscribers",
        label: "Удерживать аудиторию",
        description: "Лояльность −12%",
        effect: { metrics: { loyalty: { amount: -12, mode: "percent" } } },
      },
    ],
  },
  {
    id: "print_shop_invoice",
    title: "Неожиданный счёт типографии",
    description:
      "Типография выставила доплату за срочный тираж и переработку ночной смены.",
    polarity: "setback",
    weight: 0.9,
    condition: (state) => state.money >= GAME_BALANCE.initialMoney * 1.5,
    choices: [
      {
        id: "pay_invoice",
        label: "Оплатить счёт",
        description: "Деньги −8%",
        effect: { money: { amount: -8, mode: "percent" } },
      },
    ],
  },
  {
    id: "source_leak",
    title: "Источник передумал",
    description:
      "Собеседник публично отказался от своих слов. Редакции приходится объяснять, почему материал вышел без дополнительной проверки.",
    polarity: "setback",
    weight: 1,
    condition: (state) => state.reputation >= 14 && state.credibility >= 14,
    choices: [
      {
        id: "defend_source",
        label: "Ответить за публикацию",
        description: "Доверие −12%",
        effect: { metrics: { credibility: { amount: -12, mode: "percent" } } },
      },
    ],
  },
  {
    id: "exclusive_ad_contract",
    title: "Эксклюзивный рекламный контракт",
    description:
      "Крупный рекламодатель предлагает щедрый контракт, но просит не освещать деятельность его конкурентов.",
    polarity: "setback",
    weight: 0.9,
    condition: (state) => state.money >= GAME_BALANCE.weeklyMoneyGoals[0],
    choices: [
      {
        id: "keep_independence",
        label: "Сохранить независимость",
        description: "Деньги −7%",
        effect: { money: { amount: -7, mode: "percent" } },
      },
    ],
  },
  {
    id: "public_confidence_crisis",
    title: "Кризис общественного доверия",
    description:
      "Газета слишком долго шла от успеха к успеху. Читатели, коллеги и герои публикаций одновременно требуют от редакции доказать, что она ещё слышит критику.",
    polarity: "setback",
    weight: 1.4,
    condition: (state) =>
      METRIC_KEYS.every((key) => {
        const { min, max } = METRIC_DEFINITIONS[key];
        return (state[key] - min) / (max - min) >= 0.68;
      }),
    choices: [
      {
        id: "face_criticism",
        label: "Принять волну критики",
        description: "Все метрики −15%",
        effect: {
          metrics: {
            influence: { amount: -15, mode: "percent" },
            credibility: { amount: -15, mode: "percent" },
            reputation: { amount: -15, mode: "percent" },
            loyalty: { amount: -15, mode: "percent" },
          },
        },
      },
    ],
  },
];

function getDirectorMode(state: GameState): DirectorMode {
  const ratios = METRIC_KEYS.map((key) => {
    const { min, max } = METRIC_DEFINITIONS[key];
    return (state[key] - min) / (max - min);
  });
  const average =
    ratios.reduce((total, value) => total + value, 0) / ratios.length;
  const weakMetrics = ratios.filter((value) => value < 0.3).length;

  if (average < 0.4 || weakMetrics >= 1) return "supportive";
  if (average >= 0.62 && ratios.every((value) => value >= 0.5)) {
    return "pressure";
  }
  return "balanced";
}

export function chooseDirectorEvent(
  state: GameState,
  random: () => number = Math.random,
): GameEvent | null {
  const mode = getDirectorMode(state);
  const chance = mode === "pressure" ? 1 : mode === "supportive" ? 0.4 : 0.55;
  if (random() >= chance) return null;

  const recentEvents = state.eventHistory ?? [];
  const eligibleEvents = GAME_EVENTS.filter(
    (event) =>
      event.condition(state) &&
      (mode === "balanced" || event.polarity === mode),
  );
  if (eligibleEvents.length === 0) return null;

  const repeatCooldown = mode === "pressure" ? 1 : 3;
  const freshEvents = eligibleEvents.filter(
    (event) => !recentEvents.slice(-repeatCooldown).includes(event.id),
  );
  const candidateEvents = freshEvents.length > 0 ? freshEvents : eligibleEvents;

  const totalWeight = candidateEvents.reduce(
    (total, event) => total + event.weight,
    0,
  );
  let draw = random() * totalWeight;
  for (const event of candidateEvents) {
    draw -= event.weight;
    if (draw < 0) return event;
  }

  return candidateEvents[candidateEvents.length - 1];
}
