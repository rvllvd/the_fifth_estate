import type { JournalistBonus, Metrics } from "../types";
import { GAME_BALANCE } from "./global";

const noBonus: Metrics = {
  influence: 0,
  credibility: 0,
  reputation: 0,
  readership: 0,
};
const BONUS = GAME_BALANCE.journalistBonuses;

export const JOURNALIST_BONUSES: Record<string, JournalistBonus> = {
  // Adds the products of the article's metrics and every same-category article's metrics.
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
        readership:
          bonus.readership +
          news.effects.readership *
            related.effects.readership *
            BONUS.sameCategorySynergy.metricScale,
      }),
      { ...noBonus },
    ),
    explanation: relatedNews.length
      ? `Синергия с ${relatedNews.length} новостями той же категории.`
      : "",
  }),

  // Morning editions get a credibility boost when published between 09:00 and 11:59.
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

  // Late-day sports reporting attracts more readers but slightly risks credibility.
  eveningSports: ({ game }) => {
    const hour = new Date(game.gameTime).getUTCHours();
    const { startHour, endHour, readership, credibility } =
      BONUS.eveningSports;
    const active = hour >= startHour && hour < endHour;
    return {
      metrics: active
        ? { ...noBonus, readership, credibility }
        : { ...noBonus },
      explanation: active
        ? `Спортивный итог дня: +${readership} читателей, но ${credibility} к доверию.`
        : "",
    };
  },

  // Weekend cinema coverage draws a larger audience on Saturday and Sunday.
  weekendPremiere: ({ game, news }) => {
    const day = new Date(game.gameTime).getUTCDay();
    const { days, category, readership, reputation } = BONUS.weekendPremiere;
    const active = days.includes(day) && news.category === category;
    return {
      metrics: active
        ? { ...noBonus, readership, reputation }
        : { ...noBonus },
      explanation: active
        ? `Кинопремьеры выходного дня: +${readership} читателей и +${reputation} репутации.`
        : "",
    };
  },

  // Investigative stories gain influence and readership, at the cost of reputation.
  sensationalIncident: ({ news }) => {
    const { category, influence, reputation, readership } =
      BONUS.sensationalIncident;
    const active = news.category === category;
    return {
      metrics: active
        ? { ...noBonus, influence, reputation, readership }
        : { ...noBonus },
      explanation: active
        ? `Громкое происшествие привлекает внимание: +${influence} влияния, +${readership} читателей, ${reputation} репутации.`
        : "",
    };
  },

  // Reports are more credible when the issue is not already damaging public trust.
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

  // A diverse issue boosts the influence of international coverage.
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

  // Each other journalist actively assigned to this issue improves the story's credibility.
  editorialTeamwork: ({ journalist, journalists }) => {
    const { credibilityPerColleague } = BONUS.editorialTeamwork;
    const colleagues = journalists.filter(
      (other) => other.id !== journalist.id && other.newsId,
    ).length;
    return {
      metrics: { ...noBonus, credibility: colleagues * credibilityPerColleague },
      explanation: colleagues
        ? `Редакционная команда работает вместе: ${colleagues} коллег(а) в выпуске, +${colleagues * credibilityPerColleague} к доверию.`
        : "",
    };
  },

  // Science, education and health stories earn extra credibility from careful sourcing.
  carefulSourcing: ({ news }) => {
    const { categories, credibility, readership } = BONUS.carefulSourcing;
    const active = categories.includes(news.category);
    return {
      metrics: active
        ? { ...noBonus, credibility, readership }
        : { ...noBonus },
      explanation: active
        ? `Тщательная проверка фактов: +${credibility} к доверию и +${readership} читатель.`
        : "",
    };
  },

  // When readership is low, culture coverage helps rebuild the audience and reputation.
  audienceRecovery: ({ game, news }) => {
    const { maximumReadership, readership, reputation } =
      BONUS.audienceRecovery;
    const { category } = BONUS.audienceRecovery;
    const active =
      game.readership < maximumReadership && news.category === category;
    return {
      metrics: active
        ? { ...noBonus, readership, reputation }
        : { ...noBonus },
      explanation: active
        ? `Помогаем вернуть аудиторию: +${readership} читателей и +${reputation} репутации.`
        : "",
    };
  },

  // Finance stories get a small reputation bonus when the paper's influence is strong.
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
