import type { Stats } from '../types';


export const STAT_LABELS: Record<keyof Stats, string> = {
  influence:   'Влияние',
  credibility: 'Доверие',
  budget:      'Бюджет',
  readership:  "Лояльность",
  money:       'Деньги',
  readers:     'Читатели',
};

export const STAT_ICONS: Record<keyof Stats, string> = {
  influence:   '📈',
  credibility: '🎯',
  budget:      '💰',
  readership:  '👥',
  money:       '💵',
  readers:     '📰',
};