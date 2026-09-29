import type { Journalist } from '../utils/storage';

export const AVAILABLE_JOURNALISTS: Journalist[] = [
  {
    id: 'ivan_petrov',
    name: 'Иван Петров',
    role: 'Политический обозреватель',
    bonus: {
      influence: 8,
      credibility: 0,
      budget: -5,
      readership: 0
    },
    cost: 5
  },
  {
    id: 'maria_sidorova',
    name: 'Мария Сидорова',
    role: 'Спортивный журналист',
    bonus: {
      influence: 6,
      credibility: 0,
      budget: -4,
      readership: 0
    },
    cost: 4
  },
  {
    id: 'alexey_kozlov',
    name: 'Алексей Козлов',
    role: 'Технологический обозреватель',
    bonus: {
      influence: 7,
      credibility: 0,
      budget: -6,
      readership: 0
    },
    cost: 6
  },
  {
    id: 'elena_smirnova',
    name: 'Елена Смирнова',
    role: 'Культурный критик',
    bonus: {
      influence: 5,
      credibility: 3,
      budget: -4,
      readership: 2
    },
    cost: 4
  },
  {
    id: 'dmitry_volkov',
    name: 'Дмитрий Волков',
    role: 'Экономический аналитик',
    bonus: {
      influence: 4,
      credibility: 5,
      budget: -3,
      readership: 1
    },
    cost: 3
  },
  {
    id: 'anna_kuznetsova',
    name: 'Анна Кузнецова',
    role: 'Социальный обозреватель',
    bonus: {
      influence: 6,
      credibility: 2,
      budget: -5,
      readership: 3
    },
    cost: 5
  },
  {
    id: 'sergey_morozov',
    name: 'Сергей Морозов',
    role: 'Криминальный репортёр',
    bonus: {
      influence: 10,
      credibility: -2,
      budget: -7,
      readership: 5
    },
    cost: 7
  },
  {
    id: 'olga_fedorova',
    name: 'Ольга Фёдорова',
    role: 'Образовательный журналист',
    bonus: {
      influence: 3,
      credibility: 8,
      budget: -2,
      readership: 0
    },
    cost: 2
  },
  {
    id: 'pavel_ivanov',
    name: 'Павел Иванов',
    role: 'Международный корреспондент',
    bonus: {
      influence: 9,
      credibility: 4,
      budget: -8,
      readership: 2
    },
    cost: 8
  },
  {
    id: 'natalia_popova',
    name: 'Наталья Попова',
    role: 'Медицинский обозреватель',
    bonus: {
      influence: 4,
      credibility: 6,
      budget: -3,
      readership: 1
    },
    cost: 3
  },
  {
    id: 'victor_sokolov',
    name: 'Виктор Соколов',
    role: 'Спортивный комментатор',
    bonus: {
      influence: 5,
      credibility: 1,
      budget: -4,
      readership: 4
    },
    cost: 4
  },
  {
    id: 'ekaterina_nikolaeva',
    name: 'Екатерина Николаева',
    role: 'Технологический блогер',
    bonus: {
      influence: 7,
      credibility: 2,
      budget: -5,
      readership: 3
    },
    cost: 5
  },
  {
    id: 'andrey_romanov',
    name: 'Андрей Романов',
    role: 'Политический аналитик',
    bonus: {
      influence: 9,
      credibility: 3,
      budget: -6,
      readership: 1
    },
    cost: 6
  },
  {
    id: 'marina_alexeeva',
    name: 'Марина Алексеева',
    role: 'Экологический журналист',
    bonus: {
      influence: 6,
      credibility: 5,
      budget: -4,
      readership: 2
    },
    cost: 4
  },
  {
    id: 'igor_lebedev',
    name: 'Игорь Лебедев',
    role: 'Финансовый обозреватель',
    bonus: {
      influence: 5,
      credibility: 7,
      budget: -3,
      readership: 0
    },
    cost: 3
  },
  {
    id: 'tatyana_vasilieva',
    name: 'Татьяна Васильева',
    role: 'Развлекательный журналист',
    bonus: {
      influence: 4,
      credibility: 0,
      budget: -3,
      readership: 6
    },
    cost: 3
  },
  {
    id: 'maxim_golubev',
    name: 'Максим Голубев',
    role: 'Научный обозреватель',
    bonus: {
      influence: 3,
      credibility: 9,
      budget: -2,
      readership: 0
    },
    cost: 2
  },
  {
    id: 'yulia_semenova',
    name: 'Юлия Семёнова',
    role: 'Общественный деятель',
    bonus: {
      influence: 7,
      credibility: 4,
      budget: -5,
      readership: 2
    },
    cost: 5
  },
  {
    id: 'konstantin_borisov',
    name: 'Константин Борисов',
    role: 'Бизнес-журналист',
    bonus: {
      influence: 6,
      credibility: 6,
      budget: -4,
      readership: 1
    },
    cost: 4
  },
  {
    id: 'veronika_mikhailova',
    name: 'Вероника Михайлова',
    role: 'Лайфстайл редактор',
    bonus: {
      influence: 5,
      credibility: 2,
      budget: -3,
      readership: 5
    },
    cost: 3
  }
];

export function getJournalistById(id: string): Journalist | undefined {
  return AVAILABLE_JOURNALISTS.find(j => j.id === id);
}

export function getAvailableJournalists(currentJournalists: Journalist[]): Journalist[] {
  const currentIds = new Set(currentJournalists.map(j => j.id));
  return AVAILABLE_JOURNALISTS.filter(j => !currentIds.has(j.id));
}
