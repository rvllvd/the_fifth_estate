export const NEWS_CATEGORY_LABELS = {
  politics: "Политика",
  sport: "Спорт",
  technology: "Технологии",
  food: "Еда",
  finance: "Финансы",
  economy: "Экономика",
  society: "Общество",
  education: "Образование",
  culture: "Культура",
  incident: "Происшествия",
  ecology: "Экология",
  auto: "Авто",
  world: "Мир",
  science: "Наука",
  health: "Здоровье",
  business: "Бизнес",
  space: "Космос",
  cinema: "Кино",
  music: "Музыка",
  fashion: "Мода",
  travel: "Путешествия",
} as const satisfies Record<string, string>;

export function getNewsCategoryLabel(category: string): string {
  return NEWS_CATEGORY_LABELS[category as keyof typeof NEWS_CATEGORY_LABELS] ?? category;
}
