// Возвращает пары ключ-значение из объекта с правильной типизацией
export function entries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}