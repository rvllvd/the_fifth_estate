import type { NewsItem } from '../utils/storage';

export const NEWS_DATA: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Выборы в мэрии',
    content: 'Кандидаты подготовили дебаты о городском бюджете',
    category: 'politics',
    effects: {
      influence: 5,
      credibility: -2,
      budget: 0,
      readership: 3
    }
  },
  {
    id: 'news-2',
    title: 'Финал чемпионата',
    content: 'Местная команда вышла в финал национальной лиги',
    category: 'sports',
    effects: {
      influence: 2,
      credibility: 0,
      budget: 3,
      readership: 8
    }
  },
  {
    id: 'news-3',
    title: 'Новый стартап',
    content: 'Локальная компания получила инвестиции',
    category: 'tech',
    effects: {
      influence: 3,
      credibility: 4,
      budget: -2,
      readership: 5
    }
  },
  {
    id: 'news-4',
    title: 'Фестиваль еды',
    content: 'Гастрономический фестиваль в центре города',
    category: 'life',
    effects: {
      influence: 1,
      credibility: 2,
      budget: 2,
      readership: 6
    }
  }
];

export function getNewsById(id: string): NewsItem | undefined {
  return NEWS_DATA.find(news => news.id === id);
}

export function getNewsByCategory(category: string): NewsItem[] {
  if (category === 'all') return NEWS_DATA;
  return NEWS_DATA.filter(news => news.category === category);
}