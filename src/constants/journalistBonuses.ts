import type { JournalistBonus, Metrics } from "../types";
import { GAME_BALANCE } from "./global";

const noBonus: Metrics = {
  influence: 0,
  credibility: 0,
  reputation: 0,
  loyalty: 0,
};
const BONUS = GAME_BALANCE.journalistBonuses;

// Реализации бонусов журналистов
// Каждый бонус принимает контекст (news, game, journalists и т.д.) и возвращает метрики и описание
export const JOURNALIST_BONUSES: Record<string, JournalistBonus> = {
  // Синергия с новостями той же категории: умножает эффекты каждой связанной новости
  sameCategorySynergy: ({ news, relatedNews }) => ({
    metrics: relatedNews.reduce(
      (bonus, related) => ({
        influence:
          bonus.influence +
          news.effects.influence *
            related.effects.influence *
            BONUS.sameCategorySynergy.metricScale,
        credibility:
          bonus.credibility +
          news.effects.credibility *
            related.effects.credibility *
            BONUS.sameCategorySynergy.metricScale,
        reputation:
          bonus.reputation +
          news.effects.reputation *
            related.effects.reputation *
            BONUS.sameCategorySynergy.metricScale,
        loyalty:
          bonus.loyalty +
          news.effects.loyalty *
            related.effects.loyalty *
            BONUS.sameCategorySynergy.metricScale,
      }),
      { ...noBonus },
    ),
    explanation: relatedNews.length
      ? `Синергия с ${relatedNews.length} новостями той же категории.`
      : "",
  }),

  // Утренний выпуск: бонус к доверию между 9:00 и 12:00
  morningEdition: ({ game }) => {
    const hour = new Date(game.gameTime).getUTCHours();
    const { startHour, endHour, credibility } = BONUS.morningEdition;
    const active = hour >= startHour && hour < endHour;
    return {
      metrics: active ? { ...noBonus, credibility } : { ...noBonus },
      explanation: active
        ? `Утренний выпуск: +${credibility} к доверию читателей.`
        : "",
    };
  },

  // Вечерний спорт: бонус к лояльности с небольшим штрафом доверию между 16:00 и 18:00
  eveningSports: ({ game }) => {
    const hour = new Date(game.gameTime).getUTCHours();
    const {
      startHour,
      endHour,
      loyalty: loyalty,
      credibility,
    } = BONUS.eveningSports;
    const active = hour >= startHour && hour < endHour;
    return {
      metrics: active
        ? { ...noBonus, loyalty: loyalty, credibility }
        : { ...noBonus },
      explanation: active
        ? `Спортивный итог дня: +${loyalty} читателей, но ${credibility} к доверию.`
        : "",
    };
  },

  // Кинопремьеры выходного дня: бонус к лояльности и репутации в субботу и воскресенье
  weekendPremiere: ({ game, news }) => {
    const day = new Date(game.gameTime).getUTCDay();
    const { days, category, loyalty, reputation } = BONUS.weekendPremiere;
    const active = days.includes(day) && news.category === category;
    return {
      metrics: active
        ? { ...noBonus, loyalty: loyalty, reputation }
        : { ...noBonus },
      explanation: active
        ? `Кинопремьеры выходного дня: +${loyalty} читателей и +${reputation} репутации.`
        : "",
    };
  },

  // Громкое происшествие: бонус к влиянию и лояльности, штраф репутации
  sensationalIncident: ({ news }) => {
    const { category, influence, reputation, loyalty } =
      BONUS.sensationalIncident;
    const active = news.category === category;
    return {
      metrics: active
        ? { ...noBonus, influence, reputation, loyalty: loyalty }
        : { ...noBonus },
      explanation: active
        ? `Громкое происшествие привлекает внимание: +${influence} влияния, +${loyalty} читателей, ${reputation} репутации.`
        : "",
    };
  },

  // Общественное доверие: бонус к доверию если доверие уже высокое
  publicTrust: ({ game }) => {
    const { minimumCredibility, credibility } = BONUS.publicTrust;
    const active = game.credibility >= minimumCredibility;
    return {
      metrics: active ? { ...noBonus, credibility } : { ...noBonus },
      explanation: active
        ? `Высокий запас доверия помогает подтвердить факты: +${credibility} к доверию.`
        : "",
    };
  },

  // Разнообразный выпуск: бонус к влиянию если 3+ категорий в выпуске
  diverseNewsroom: ({ placedNewsItems }) => {
    const categories = new Set(placedNewsItems.map((item) => item.category));
    const { minimumCategories, influence } = BONUS.diverseNewsroom;
    const active = categories.size >= minimumCategories;
    return {
      metrics: active ? { ...noBonus, influence } : { ...noBonus },
      explanation: active
        ? `В выпуске представлены ${minimumCategories} и более темы: +${influence} к влиянию.`
        : "",
    };
  },

  // Редакционная командная работа: бонус к доверию за каждого работающего коллеги
  editorialTeamwork: ({ journalist, journalists }) => {
    const { credibilityPerColleague } = BONUS.editorialTeamwork;
    const colleagues = journalists.filter(
      (other) => other.id !== journalist.id && other.newsId,
    ).length;
    return {
      metrics: {
        ...noBonus,
        credibility: colleagues * credibilityPerColleague,
      },
      explanation: colleagues
        ? `Редакционная команда работает вместе: ${colleagues} коллег(а) в выпуске, +${colleagues * credibilityPerColleague} к доверию.`
        : "",
    };
  },

  // Тщательная проверка источников: бонус к доверию и лояльности для науки/образования/здоровья
  carefulSourcing: ({ news }) => {
    const { categories, credibility, loyalty } = BONUS.carefulSourcing;
    const active = categories.includes(news.category);
    return {
      metrics: active
        ? { ...noBonus, credibility, loyalty: loyalty }
        : { ...noBonus },
      explanation: active
        ? `Тщательная проверка фактов: +${credibility} к доверию и +${loyalty} читатель.`
        : "",
    };
  },

  // Восстановление аудитории: бонус к лояльности и репутации для культуры при низкой лояльности
  audienceRecovery: ({ game, news }) => {
    const { maximumloyalty, loyalty, reputation } = BONUS.audienceRecovery;
    const { category } = BONUS.audienceRecovery;
    const active = game.loyalty < maximumloyalty && news.category === category;
    return {
      metrics: active
        ? { ...noBonus, loyalty: loyalty, reputation }
        : { ...noBonus },
      explanation: active
        ? `Помогаем вернуть аудиторию: +${loyalty} читателей и +${reputation} репутации.`
        : "",
    };
  },

  // Рыночный авторитет: бонус к репутации и доверию для финансов при высоком влиянии
  marketAuthority: ({ game, news }) => {
    const { minimumInfluence, category, reputation, credibility } =
      BONUS.marketAuthority;
    const active =
      game.influence >= minimumInfluence && news.category === category;
    return {
      metrics: active
        ? { ...noBonus, reputation, credibility }
        : { ...noBonus },
      explanation: active
        ? `Сильное влияние редакции укрепляет финансовую аналитику: +${reputation} репутации и +${credibility} доверия.`
        : "",
    };
  },
};
