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
  nav_rocket_engines: { ru: "Ракета", en: "Rocket" },
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
  food_select_open_panel_hint: {
    ru: "Откройте панель выбора еды справа",
    en: "Open the food picker panel on the right",
  },
  aria_food_open_picker_panel: {
    ru: "Открыть панель выбора еды",
    en: "Open food picker panel",
  },
  aria_food_close_picker_panel: {
    ru: "Закрыть панель выбора еды",
    en: "Close food picker panel",
  },
  food_quality_label: { ru: "Качество:", en: "Quality:" },
  food_section_plants: { ru: "Растения", en: "Plants" },
  food_section_food: { ru: "Еда", en: "Food" },
  food_section_resources: { ru: "Ресурсы", en: "Resources" },
  food_section_liquids: { ru: "Жидкости", en: "Liquids" },
  food_section_tools: { ru: "Инструменты", en: "Tools" },
  food_clear: { ru: "Сброс", en: "Clear" },
  food_picker_drawer_title: { ru: "Выбор еды", en: "Food selection" },
  aria_decrease_count: { ru: "Уменьшить", en: "Decrease count" },
  aria_increase_count: { ru: "Увеличить", en: "Increase count" },
  unit_grams: { ru: "г", en: "g" },
  unit_kcal: { ru: "ккал", en: "kcal" },

  settings_tab_app: { ru: "Приложение", en: "App" },
  settings_tab_game: { ru: "Колония", en: "Colony" },
  settings_tab_space_map: { ru: "Звездная карта", en: "Star map" },
  rocket_name_label: { ru: "Название ракеты", en: "Rocket name" },
  rocket_route_one_way_warning: {
    ru: "Путь в один конец: маршрут заканчивается не на центральной клетке карты.",
    en: "One-way route: the path does not end on the map center cell.",
  },
  rocket_section_fuel: { ru: "Топливо", en: "Fuel" },
  rocket_fuel_tank_insufficient: {
    ru: "На текущий маршрут встроенного бака этого двигателя не хватает — выберите другой двигатель или укоротите путь.",
    en: "This engine's integrated tank is too small for the current route — pick another engine or shorten the path.",
  },
  rocket_fuel_route_hint: {
    ru: "Укажите маршрут из минимум двух клеток — тогда появится расчёт баков.",
    en: "Draw a route of at least two cells — then tank calculations will appear.",
  },
  rocket_fuel_consumption: {
    ru: "Расход за полёт: {{kg}} кг",
    en: "Fuel per flight: {{kg}} kg",
  },
  rocket_fuel_integrated_tank_suffix: {
    ru: " · встроенный бак",
    en: " · integrated tank",
  },
  rocket_fuel_tanks_count: {
    ru: " · баков: {{count}}",
    en: " · tanks: {{count}}",
  },
  rocket_section_oxidizer: { ru: "Окислитель", en: "Oxidizer" },
  aria_rocket_oxidizer_type: {
    ru: "Тип окислителя",
    en: "Oxidizer type",
  },
  rocket_oxidizer_row_line: {
    ru: "{{kg}} кг · баков: {{tanks}}",
    en: "{{kg}} kg · tanks: {{tanks}}",
  },
  rocket_default_name: {
    ru: "Ракета {{n}}",
    en: "Rocket {{n}}",
  },
  rocket_moves_label: {
    ru: "Перемещений: {{count}}",
    en: "Moves: {{count}}",
  },
  rocket_select_engine: {
    ru: "Выберите двигатель",
    en: "Select engine",
  },
  rocket_section_speed: { ru: "Скорость", en: "Speed" },
  rocket_flight_cycles: {
    ru: "Циклов полёта",
    en: "Flight cycles",
  },
  rocket_speed_route_hint: {
    ru: "Задайте маршрут из двух и более клеток",
    en: "Set a route of two or more cells",
  },
  rocket_speed_cells_per_cycle: {
    ru: "{{steps}} клеток / {{speed}} за цикл",
    en: "{{steps}} cells / {{speed}} per cycle",
  },
  rocket_modules_speed_hint: {
    ru: "Устанавливаемые модули не влияют на дальность полёта ракеты, только на скорость.",
    en: "Installed modules do not affect flight range — only speed.",
  },
  aria_rocket_open_sidebar: {
    ru: "Открыть панель ракеты",
    en: "Open rocket panel",
  },
  rocket_sidebar_title: {
    ru: "Настройка ракеты",
    en: "Rocket settings",
  },
  rocket_delete_dialog_title: {
    ru: "Удаление {{name}}",
    en: "Delete {{name}}",
  },
  rocket_engine_picker_title: {
    ru: "Двигатель",
    en: "Engine",
  },

  rocket_builder_select_route_engine: {
    ru: "Выберите путь полёта и двигатель",
    en: "Select a flight path and engine",
  },
  rocket_builder_aria_add_module_on_stack: {
    ru: "Добавить модуль поверх ракеты",
    en: "Add module on top of the rocket",
  },
  rocket_builder_module_remove_hint: {
    ru: "Нажмите, чтобы удалить модуль",
    en: "Click to remove module",
  },
  rocket_builder_add_module_popup_title: {
    ru: "Добавить модуль",
    en: "Add module",
  },
  rocket_builder_catalog_empty_before: {
    ru: "Элементов пока нет — добавьте их в ",
    en: "No items yet — add them to ",
  },
  rocket_builder_section_modules: { ru: "Модули", en: "Modules" },
  rocket_builder_section_cargo: {
    ru: "Грузовые отсеки",
    en: "Cargo bays",
  },
  rocket_builder_section_noses: { ru: "Носы", en: "Noses" },
  rocket_builder_section_tanks: { ru: "Баки", en: "Tanks" },

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
  button_add: { ru: "Добавить", en: "Add" },
  button_delete: { ru: "Удалить", en: "Delete" },
  aria_close: { ru: "Закрыть", en: "Close" },

  hex_map_select_route_hint: {
    ru: "ЛКМ — продолжить маршрут от текущего конца (если маршрута нет — от центра карты). ПКМ — новый маршрут от центра до выбранной клетки.",
    en: "Left click — extend the route from the current end (if there is no route yet, from the map center). Right click — new route from the center to the selected cell.",
  },
  hex_map_reset_route: { ru: "Сбросить маршрут", en: "Reset route" },
  hex_map_aria_cell: { ru: "Ячейка {{idx}}", en: "Cell {{idx}}" },
  hex_map_aria_object_index: { ru: "Объект {{idx}}", en: "Object {{idx}}" },
  hex_map_aria_new_object_dialog: { ru: "Новый объект", en: "New object" },
  hex_map_cell_only: { ru: "Клетка {{cell}}", en: "Cell {{cell}}" },
  hex_map_pass_on_create: {
    ru: "Передайте onCreateObject, чтобы сохранять.",
    en: "Pass onCreateObject to enable saving.",
  },
  hex_map_pass_on_update: {
    ru: "Передайте onUpdateObject, чтобы сохранять правки.",
    en: "Pass onUpdateObject to persist edits.",
  },
  hex_map_pass_on_delete: {
    ru: "Чтобы удалять объекты, передайте onDeleteObject.",
    en: "Pass onDeleteObject to enable deletion.",
  },
  hex_map_main_delete_forbidden_title: {
    ru: "Основной объект нельзя удалить",
    en: "The home object cannot be deleted",
  },
  hex_map_svg_title: { ru: "Гексагональная карта", en: "Hex map" },

  star_map_edit_object: { ru: "Объект на карте", en: "Map object" },
  star_map_delete_object_confirm: {
    ru: "Удалить «{{name}}» с карты?",
    en: 'Remove "{{name}}" from the map?',
  },
  aria_star_map_edit_object: { ru: "Редактировать объект", en: "Edit object" },
  aria_star_map_delete_object: { ru: "Удалить объект", en: "Delete object" },
  star_map_type_planet: { ru: "Планета", en: "Planet" },
  star_map_type_wreck: { ru: "Обломок", en: "Wreck" },
  star_map_type_nebula: { ru: "Туманность", en: "Nebula" },
  star_map_main_short: { ru: "основная", en: "home" },
  star_map_cell_coords: {
    ru: "Клетка {{cell}} · q {{q}}, r {{r}}",
    en: "Cell {{cell}} · q {{q}}, r {{r}}",
  },
  star_map_empty_catalog: {
    ru: "На карте пока нет объектов — откройте редактор и добавьте планеты, туманности или обломки.",
    en: "No objects on the map yet — open the editor to add planets, nebulae, or wrecks.",
  },
  star_map_open_editor: { ru: "Изменить карту", en: "Edit map" },

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
