export type Locale = 'en' | 'ru'

const en: Record<string, string> = {
  // Tabs
  'tabs.today': 'Today',
  'tabs.year': 'Year',
  'tabs.settings': 'Settings',

  // Today
  'today.title': 'Today',
  'today.noHabits': 'No habits yet',
  'today.addFirst': 'Tap + to create your first habit',
  'today.needHelp': 'Need help? @habitsupportbot',
  'today.support': 'Support @habitsupportbot',

  // Common
  'common.save': 'Save',
  'common.saving': 'Saving...',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.back': 'Back',

  // Habits
  'habits.new': 'New Habit',
  'habits.edit': 'Edit Habit',
  'habits.name': 'Name',
  'habits.color': 'Color',
  'habits.days': 'Days',
  'habits.time': 'Reminder time',
  'habits.templates': 'Templates',
  'habits.namePlaceholder': 'e.g., Read 30 minutes',
  'habits.deleteConfirm': 'Are you sure you want to delete "{name}"? This action cannot be undone.',
  'habits.deleteTitle': 'Delete Habit',
  'habits.addLabel': 'Add habit',

  // Detail
  'detail.progress': 'Progress',
  'detail.calendar': 'Calendar',
  'detail.days': 'Days',
  'detail.weeks': 'Weeks',
  'detail.months': 'Months',
  'detail.dayStreak': 'day streak',
  'detail.daysOf7': '{n} days of 7',
  'detail.weeksOf4': '{n} weeks of 4',
  'detail.monthsOf12': '{n} months of 12',

  // Habit card
  'card.day': 'day',
  'card.days': 'days',

  // Settings
  'settings.status': 'Status',
  'settings.backend': 'Backend',
  'settings.online': 'Online',
  'settings.offline': 'Offline',
  'settings.checking': 'Checking...',
  'settings.platform': 'Platform',
  'settings.device': 'Device',
  'settings.mobile': 'Mobile',
  'settings.desktop': 'Desktop',
  'settings.support': 'Support',
  'settings.questionsOrFeedback': 'Questions or feedback?',
  'settings.about': 'About',
  'settings.aboutText': 'Habit Tracker — track your daily habits and build streaks.',
  'settings.authenticated': 'Authenticated',
  'settings.notAuthenticated': 'Not authenticated',

  // Year
  'year.title': 'Year',
  'year.noHabits': 'No habits yet',

  // Heatmap legend
  'heatmap.notScheduled': 'Not scheduled',
  'heatmap.missed': 'Missed',
  'heatmap.completed': 'Completed',
  'heatmap.daysCompleted': '{n} days completed',

  // Days
  'days.mon': 'Mon',
  'days.tue': 'Tue',
  'days.wed': 'Wed',
  'days.thu': 'Thu',
  'days.fri': 'Fri',
  'days.sat': 'Sat',
  'days.sun': 'Sun',

  // Months
  'months.january': 'January',
  'months.february': 'February',
  'months.march': 'March',
  'months.april': 'April',
  'months.may': 'May',
  'months.june': 'June',
  'months.july': 'July',
  'months.august': 'August',
  'months.september': 'September',
  'months.october': 'October',
  'months.november': 'November',
  'months.december': 'December',

  // Short months
  'months.jan': 'Jan',
  'months.feb': 'Feb',
  'months.mar': 'Mar',
  'months.apr': 'Apr',
  'months.mayShort': 'May',
  'months.jun': 'Jun',
  'months.jul': 'Jul',
  'months.aug': 'Aug',
  'months.sep': 'Sep',
  'months.oct': 'Oct',
  'months.nov': 'Nov',
  'months.dec': 'Dec',
}

const ru: Record<string, string> = {
  // Tabs
  'tabs.today': 'Сегодня',
  'tabs.year': 'Год',
  'tabs.settings': 'Настройки',

  // Today
  'today.title': 'Сегодня',
  'today.noHabits': 'Пока нет привычек',
  'today.addFirst': 'Нажмите + чтобы создать привычку',
  'today.needHelp': 'Нужна помощь? @habitsupportbot',
  'today.support': 'Поддержка @habitsupportbot',

  // Common
  'common.save': 'Сохранить',
  'common.saving': 'Сохранение...',
  'common.cancel': 'Отмена',
  'common.delete': 'Удалить',
  'common.edit': 'Изменить',
  'common.back': 'Назад',

  // Habits
  'habits.new': 'Новая привычка',
  'habits.edit': 'Изменить привычку',
  'habits.name': 'Название',
  'habits.color': 'Цвет',
  'habits.days': 'Дни',
  'habits.time': 'Время напоминания',
  'habits.templates': 'Шаблоны',
  'habits.namePlaceholder': 'напр., Читать 30 минут',
  'habits.deleteConfirm': 'Вы уверены, что хотите удалить «{name}»? Это действие нельзя отменить.',
  'habits.deleteTitle': 'Удалить привычку',
  'habits.addLabel': 'Добавить привычку',

  // Detail
  'detail.progress': 'Прогресс',
  'detail.calendar': 'Календарь',
  'detail.days': 'Дни',
  'detail.weeks': 'Недели',
  'detail.months': 'Месяцы',
  'detail.dayStreak': 'дн. подряд',
  'detail.daysOf7': '{n} дн. из 7',
  'detail.weeksOf4': '{n} нед. из 4',
  'detail.monthsOf12': '{n} мес. из 12',

  // Habit card
  'card.day': 'день',
  'card.days': 'дн.',

  // Settings
  'settings.status': 'Статус',
  'settings.backend': 'Сервер',
  'settings.online': 'Онлайн',
  'settings.offline': 'Оффлайн',
  'settings.checking': 'Проверка...',
  'settings.platform': 'Платформа',
  'settings.device': 'Устройство',
  'settings.mobile': 'Мобильный',
  'settings.desktop': 'Десктоп',
  'settings.support': 'Поддержка',
  'settings.questionsOrFeedback': 'Вопросы или отзывы?',
  'settings.about': 'О приложении',
  'settings.aboutText': 'Habit Tracker — отслеживайте ежедневные привычки и стройте серии.',
  'settings.authenticated': 'Авторизован',
  'settings.notAuthenticated': 'Не авторизован',

  // Year
  'year.title': 'Год',
  'year.noHabits': 'Пока нет привычек',

  // Heatmap legend
  'heatmap.notScheduled': 'Не запланировано',
  'heatmap.missed': 'Пропущено',
  'heatmap.completed': 'Выполнено',
  'heatmap.daysCompleted': '{n} дн. выполнено',

  // Days
  'days.mon': 'Пн',
  'days.tue': 'Вт',
  'days.wed': 'Ср',
  'days.thu': 'Чт',
  'days.fri': 'Пт',
  'days.sat': 'Сб',
  'days.sun': 'Вс',

  // Months
  'months.january': 'Январь',
  'months.february': 'Февраль',
  'months.march': 'Март',
  'months.april': 'Апрель',
  'months.may': 'Май',
  'months.june': 'Июнь',
  'months.july': 'Июль',
  'months.august': 'Август',
  'months.september': 'Сентябрь',
  'months.october': 'Октябрь',
  'months.november': 'Ноябрь',
  'months.december': 'Декабрь',

  // Short months
  'months.jan': 'Янв',
  'months.feb': 'Фев',
  'months.mar': 'Мар',
  'months.apr': 'Апр',
  'months.mayShort': 'Май',
  'months.jun': 'Июн',
  'months.jul': 'Июл',
  'months.aug': 'Авг',
  'months.sep': 'Сен',
  'months.oct': 'Окт',
  'months.nov': 'Ноя',
  'months.dec': 'Дек',
}

const translations: Record<Locale, Record<string, string>> = { en, ru }

export function getTranslations(locale: Locale): Record<string, string> {
  return translations[locale] || translations.en
}

const MONTH_KEYS = [
  'months.january', 'months.february', 'months.march', 'months.april',
  'months.may', 'months.june', 'months.july', 'months.august',
  'months.september', 'months.october', 'months.november', 'months.december',
] as const

const SHORT_MONTH_KEYS = [
  'months.jan', 'months.feb', 'months.mar', 'months.apr',
  'months.mayShort', 'months.jun', 'months.jul', 'months.aug',
  'months.sep', 'months.oct', 'months.nov', 'months.dec',
] as const

const DAY_KEYS = [
  'days.mon', 'days.tue', 'days.wed', 'days.thu',
  'days.fri', 'days.sat', 'days.sun',
] as const

export function getMonthNames(t: (key: string) => string): string[] {
  return MONTH_KEYS.map(t)
}

export function getShortMonthNames(t: (key: string) => string): string[] {
  return SHORT_MONTH_KEYS.map(t)
}

export function getDayNames(t: (key: string) => string): string[] {
  return DAY_KEYS.map(t)
}
