import type { ISupportedLanguages } from "../providers/localization-provider";
import { gameDataTranslations } from "./gameDataTranslations";

export const translations = {
  app_title: {
    ru: "Simple ONI Calculator",
    en: "Simple ONI Calculator",
  },
  lang_short_label: { ru: "Язык", en: "Lang" },
  aria_game_settings_duplicants: {
    ru: "Настройки колонии, {{count}} дупликантов",
    en: "Colony settings, {{count}} duplicants",
  },

  nav_home: { ru: "Главная", en: "Home" },
  nav_food: { ru: "Еда", en: "Food" },
  nav_settings: { ru: "Настройки", en: "Settings" },
  nav_open_menu: { ru: "Открыть меню", en: "Open menu" },
  nav_close_menu: { ru: "Закрыть меню", en: "Close menu" },
  nav_menu_title: { ru: "Меню", en: "Menu" },

  page_home_intro: {
    ru: "Это вспомогательный калькулятор для игры Oxygen Not Included.",
    en: "This is a companion calculator for the game Oxygen Not Included.",
  },
  page_home_food_before: {
    ru: "В приложении есть ",
    en: "The app includes a ",
  },
  page_home_food_link: {
    ru: "калькулятор еды",
    en: "food calculator",
  },
  page_home_food_after: {
    ru: ". С его помощью можно посчитать необходимое количество растений для посадки, чтобы обеспечить колонию пропитанием.",
    en: ". Use it to work out how many plants you need to grow to feed your colony.",
  },
  page_home_contact_prefix: {
    ru: "При возникновении вопросов или пожеланий напишите мне на почту:",
    en: "If you have questions or suggestions, email me at:",
  },
  page_home_duplicants_hint: {
    ru: "В настройках на вкладке «Колония» можно указать дупликантов колонии — их количество автоматически подставляется в калькулятор еды.",
    en: "In Settings under the Colony tab you can add your colony's duplicants — their count is applied automatically in the food calculator.",
  },
  page_home_browser_storage: {
    ru: "Вводимые вами данные сохраняются локально и привязаны к этому браузеру — они не передаются на сервер.",
    en: "The data you enter is saved locally and stays tied to this browser — it is not sent to any server.",
  },

  food_tab_food: { ru: "Еда", en: "Food" },
  food_tab_info: { ru: "Инфо", en: "Info" },
  food_resource_info_tooltip: {
    ru: "Значения ресурсов даны за цикл; растения рассчитаны так, чтобы хватило еды на время их цикла роста.",
    en: "Resource values are given per cycle; plants are calculated so that there is enough food for the duration of their growth cycle.",
  },
  food_select_prompt: {
    ru: "Выберите еду справа",
    en: "Select food on the right",
  },
  food_quality_label: { ru: "Качество:", en: "Quality:" },
  food_section_plants: { ru: "Растения", en: "Plants" },
  food_section_food: { ru: "Еда", en: "Food" },
  food_section_resources: { ru: "Ресурсы", en: "Resources" },
  food_section_liquids: { ru: "Жидкости", en: "Liquids" },
  food_section_tools: { ru: "Инструменты", en: "Tools" },
  food_clear: { ru: "Сброс", en: "Clear" },
  aria_decrease_count: { ru: "Уменьшить", en: "Decrease count" },
  aria_increase_count: { ru: "Увеличить", en: "Increase count" },
  unit_grams: { ru: "г", en: "g" },
  unit_kcal: { ru: "ккал", en: "kcal" },

  settings_tab_app: { ru: "Приложение", en: "App" },
  settings_tab_game: { ru: "Колония", en: "Colony" },

  settings_theme: { ru: "Тема", en: "Theme" },
  settings_language: { ru: "Язык", en: "Language" },
  theme_system: { ru: "Системная", en: "System" },
  theme_light: { ru: "Светлая", en: "Light" },
  theme_dark: { ru: "Тёмная", en: "Dark" },

  game_edit_duplicant: { ru: "Редактировать дупликанта", en: "Edit duplicant" },
  game_add_duplicant: { ru: "Добавить дупликанта", en: "Add duplicant" },
  aria_add_duplicant: { ru: "Добавить дупликанта", en: "Add duplicant" },
  game_no_duplicants_hint: {
    ru: "Дупликантов пока нет. Нажмите +, чтобы добавить.",
    en: "No duplicants yet. Tap + to add one.",
  },

  dupe_name_label: { ru: "Имя", en: "Name" },
  dupe_peculiarities: { ru: "Особенности", en: "Peculiarities" },
  dupe_bottomless_stomach: { ru: "Бездонный желудок", en: "Bottomless stomach" },
  dupe_trait_bottomless: { ru: "Бездонный желудок", en: "Bottomless stomach" },

  validation_name_required: {
    ru: "Введите имя",
    en: "Enter name",
  },

  delete_duplicant_confirm: {
    ru: "Удалить «{{name}}»?",
    en: 'Are you sure you want to delete "{{name}}"?',
  },
  aria_delete_duplicant: { ru: "Удалить дупликанта", en: "Delete duplicant" },
  aria_edit_duplicant: { ru: "Редактировать дупликанта", en: "Edit duplicant" },

  dialog_confirmation: { ru: "Подтверждение", en: "Confirmation" },
  dialog_confirm_question: {
    ru: "Вы уверены?",
    en: "Are you sure?",
  },
  button_cancel: { ru: "Отмена", en: "Cancel" },
  button_confirm: { ru: "Подтвердить", en: "Confirm" },
  button_save: { ru: "Сохранить", en: "Save" },

  label_type: { ru: "Тип", en: "Type" },
  label_quality: { ru: "Качество", en: "Quality" },

  game_node_food: { ru: "Еда", en: "Food" },
  game_node_ingredient: { ru: "Ингредиент", en: "Ingredient" },
  game_node_liquid: { ru: "Жидкость", en: "Liquid" },
  game_node_plant: { ru: "Растение", en: "Plant" },
  game_node_resource: { ru: "Ресурс", en: "Resource" },
  game_node_kitchen_tool: {
    ru: "Кухонный инструмент",
    en: "Kitchen tool",
  },

  quality_grisly: { ru: "Ужасное", en: "Grisly" },
  quality_terrible: { ru: "Ужасно", en: "Terrible" },
  quality_poor: { ru: "Плохое", en: "Poor" },
  quality_standard: { ru: "Обычное", en: "Standard" },
  quality_good: { ru: "Хорошее", en: "Good" },
  quality_great: { ru: "Отличное", en: "Great" },
  quality_superb: { ru: "Превосходное", en: "Superb" },
  quality_ambrosial: { ru: "Амброзия", en: "Ambrosial" },
  quality_unknown: { ru: "Неизвестно", en: "Unknown" },

  select_no_matches: { ru: "Нет совпадений", en: "No matches" },
  select_close_list: { ru: "Закрыть список", en: "Close list" },
  select_open_list: { ru: "Открыть список", en: "Open list" },
  search_label: { ru: "Поиск", en: "Search" },
  food_search_no_results: {
    ru: "Ничего не найдено",
    en: "No matches",
  },
  ...gameDataTranslations,
} as const satisfies Record<
  string,
  Record<ISupportedLanguages, string>
>;

export type TranslationKey = keyof typeof translations;
