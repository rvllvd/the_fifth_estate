import type { JournalistBonus, Metrics } from "../types";

const noBonus: Metrics = {
  influence: 0,
  credibility: 0,
  reputation: 0,
  readership: 0,
};

export const JOURNALIST_BONUSES: Record<string, JournalistBonus> = {
  // Adds the products of the article's metrics and every same-category article's metrics.
  sameCategorySynergy: ({ news, relatedNews }) => ({
    metrics: relatedNews.reduce(
      (bonus, related) => ({
        influence:
          bonus.influence +
          news.effects.influence * related.effects.influence,
        credibility:
          bonus.credibility +
          news.effects.credibility * related.effects.credibility,
        reputation:
          bonus.reputation +
          news.effects.reputation * related.effects.reputation,
        readership:
          bonus.readership +
          news.effects.readership * related.effects.readership,
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
    const active = hour >= 9 && hour < 12;
    return {
      metrics: active ? { ...noBonus, credibility: 5 } : { ...noBonus },
      explanation: active ? "Утренний выпуск: +5 к доверию читателей." : "",
    };
  },

  // Late-day sports reporting attracts more readers but slightly risks credibility.
  eveningSports: ({ game }) => {
    const hour = new Date(game.gameTime).getUTCHours();
    const active = hour >= 16 && hour < 18;
    return {
      metrics: active
        ? { ...noBonus, readership: 7, credibility: -1 }
        : { ...noBonus },
      explanation: active
        ? "Спортивный итог дня: +7 читателей, но −1 к доверию."
        : "",
    };
  },

  // Weekend cinema coverage draws a larger audience on Saturday and Sunday.
  weekendPremiere: ({ game, news }) => {
    const day = new Date(game.gameTime).getUTCDay();
    const active = (day === 0 || day === 6) && news.category === "cinema";
    return {
      metrics: active ? { ...noBonus, readership: 6, reputation: 1 } : { ...noBonus },
      explanation: active
        ? "Кинопремьеры выходного дня: +6 читателей и +1 репутации."
        : "",
    };
  },

  // Investigative stories gain influence and readership, at the cost of reputation.
  sensationalIncident: ({ news }) => {
    const active = news.category === "incident";
    return {
      metrics: active
        ? { ...noBonus, influence: 3, reputation: -2, readership: 5 }
        : { ...noBonus },
      explanation: active
        ? "Громкое происшествие привлекает внимание: +3 влияния, +5 читателей, −2 репутации."
        : "",
    };
  },

  // Reports are more credible when the issue is not already damaging public trust.
  publicTrust: ({ game }) => {
    const active = game.credibility >= 50;
    return {
      metrics: active ? { ...noBonus, credibility: 4 } : { ...noBonus },
      explanation: active
        ? "Высокий запас доверия помогает подтвердить факты: +4 к доверию."
        : "",
    };
  },

  // A diverse issue boosts the influence of international coverage.
  diverseNewsroom: ({ placedNewsItems }) => {
    const categories = new Set(placedNewsItems.map((item) => item.category));
    const active = categories.size >= 3;
    return {
      metrics: active ? { ...noBonus, influence: 5 } : { ...noBonus },
      explanation: active
        ? "В выпуске представлены три и более темы: +5 к влиянию."
        : "",
    };
  },

  // Each other journalist actively assigned to this issue improves the story's credibility.
  editorialTeamwork: ({ journalist, journalists }) => {
    const colleagues = journalists.filter(
      (other) => other.id !== journalist.id && other.newsId,
    ).length;
    return {
      metrics: { ...noBonus, credibility: colleagues * 2 },
      explanation: colleagues
        ? `Редакционная команда работает вместе: ${colleagues} коллег(а) в выпуске, +${colleagues * 2} к доверию.`
        : "",
    };
  },

  // Science, education and health stories earn extra credibility from careful sourcing.
  carefulSourcing: ({ news }) => {
    const active = ["science", "education", "health"].includes(news.category);
    return {
      metrics: active ? { ...noBonus, credibility: 6, readership: 1 } : { ...noBonus },
      explanation: active
        ? "Тщательная проверка фактов: +6 к доверию и +1 читатель."
        : "",
    };
  },

  // When readership is low, culture coverage helps rebuild the audience and reputation.
  audienceRecovery: ({ game, news }) => {
    const active = game.readership < 40 && news.category === "culture";
    return {
      metrics: active
        ? { ...noBonus, readership: 6, reputation: 2 }
        : { ...noBonus },
      explanation: active
        ? "Помогаем вернуть аудиторию: +6 читателей и +2 репутации."
        : "",
    };
  },

  // Finance stories get a small reputation bonus when the paper's influence is strong.
  marketAuthority: ({ game, news }) => {
    const active = game.influence >= 60 && news.category === "finance";
    return {
      metrics: active ? { ...noBonus, reputation: 5, credibility: 2 } : { ...noBonus },
      explanation: active
        ? "Сильное влияние редакции укрепляет финансовую аналитику: +5 репутации и +2 доверия."
        : "",
    };
  },
};
