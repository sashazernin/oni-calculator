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
  nav_planetoids: { ru: "Планетойд", en: "Planetoid" },
  nav_colony: { ru: "Колония", en: "Colony" },
  nav_star_map: { ru: "Звёздная карта", en: "Star map" },
  nav_rocket_engines: { ru: "Ракеты", en: "Rockets" },
  star_map_classic_unavailable: {
    ru: "Звёздная карта доступна только для планетойда типа Spaced Out.",
    en: "The star map is only available for Spaced Out planetoids.",
  },
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
  page_home_rocket_before: {
    ru: "Также есть ",
    en: "There is also a ",
  },
  page_home_rocket_link: {
    ru: "страница ракеты",
    en: "rocket page",
  },
  page_home_rocket_after: {
    ru: " - расчёт маршрута и модулей. В настройках на вкладке «Звездная карта» можно выставить объекты на карте.",
    en: " - for route and module planning. In Settings under the Star map tab you can place objects on the map.",
  },
  page_home_contact_prefix: {
    ru: "При возникновении вопросов или пожеланий напишите мне на почту:",
    en: "If you have questions or suggestions, email me at:",
  },
  page_home_planetoids_before: {
    ru: "В приложении есть раздел ",
    en: "The app has a ",
  },
  page_home_planetoids_link: {
    ru: "Планетойд",
    en: "Planetoid",
  },
  page_home_planetoids_after: {
    ru: " - несколько колоний в одном сохранении. У каждой свои дупликанты, ракеты и (для Spaced Out) звёздная карта; для планетойда можно выбрать классическую игру или дополнение Spaced Out.",
    en: " section for several colonies in one save. Each has its own duplicants, rockets, and (for Spaced Out) star map; you can mark Classic or the Spaced Out expansion per planetoid.",
  },
  page_home_duplicants_hint: {
    ru: "В разделе «Колония» можно указать дупликантов - их количество автоматически подставляется в калькулятор еды.",
    en: "In Colony you can add duplicants - their count is applied automatically in the food calculator.",
  },
  page_home_browser_storage: {
    ru: "По умолчанию настройки и данные колонии сохраняются в памяти браузера; у проекта нет своего сервера. При желании можно подключить облачное хранение через Google Диск - они синхронизируются с вашим аккаунтом Google. Подробнее - в",
    en: "By default, settings and colony data are saved in this browser’s storage; this project has no server of its own. You can optionally connect Google Drive cloud storage - they sync to your Google account. See the",
  },
  page_home_privacy_link: {
    ru: "политике конфиденциальности",
    en: "Privacy Policy",
  },

  privacy_title: {
    ru: "Политика конфиденциальности - Simple ONI Calculator",
    en: "Privacy Policy - Simple ONI Calculator",
  },
  privacy_updated: {
    ru: "Последнее обновление: 24 октября 2026 г.",
    en: "Last updated: October 24, 2026",
  },
  privacy_intro: {
    ru: "Simple ONI Calculator - это бесплатный вспомогательный калькулятор для игры Oxygen Not Included. Это личный проект одного разработчика, у сайта нет своего бэкенда и баз данных для сбора информации пользователей.",
    en: "Simple ONI Calculator is a free companion tool for Oxygen Not Included. It is a solo personal project; this site has no backend or databases to collect user information.",
  },
  privacy_section_google_title: {
    ru: "1. Использование данных Google (Google User Data)",
    en: "1. Google user data",
  },
  privacy_section_google_body: {
    ru: "Приложение запрашивает доступ к вашему Google Диску через OAuth 2.0 и API Google (https://www.googleapis.com).\n\nДоступ нужен только чтобы вы могли сохранять, обновлять и скачивать файлы конфигурации калькулятора (JSON с параметрами ракет, дупликантов и настроек) напрямую в своё облачное хранилище.\n\nРазработчик сайта не собирает, не просматривает и не передаёт третьим лицам файлы с вашего Google Диска. Запросы выполняются в вашем браузере напрямую к серверам Google API.",
    en: "The app may request access to your Google Drive via OAuth 2.0 and the Google API (https://www.googleapis.com).\n\nAccess is only used so you can save, update, and download calculator configuration files (JSON with rockets, duplicants, and settings) to your own cloud storage.\n\nThe site developer does not collect, view, or share your Google Drive files with third parties. Requests run in your browser directly to Google’s API servers.",
  },
  privacy_section_local_title: {
    ru: "2. Данные в браузере (Local Storage)",
    en: "2. Data in your browser (local storage)",
  },
  privacy_section_local_body: {
    ru: "В локальном хранилище браузера (localStorage) могут сохраняться настройки интерфейса (тема, язык), данные колонии (дупликанты, ракеты, звёздная карта) и текущие расчёты. Данные остаются только на вашем устройстве, пока вы не очистите данные сайта в браузере.",
    en: "Your browser’s localStorage may hold UI settings (theme, language), colony data (duplicants, rockets, star map), and current calculations. Data stays on your device until you clear site data in the browser.",
  },
  privacy_section_analytics_title: {
    ru: "3. Сторонняя аналитика",
    en: "3. Third-party analytics",
  },
  privacy_section_analytics_body: {
    ru: "На сайте подключены Google Analytics и Яндекс.Метрика. Они собирают обезличенные технические данные (тип устройства, браузер, время на сайте) для улучшения интерфейса приложения. Подробности - в политиках Google и Яндекса.",
    en: "Google Analytics and Yandex Metrica are used on this site. They collect anonymized technical data (device type, browser, time on site) to improve the app. See Google’s and Yandex’s privacy policies for details.",
  },
  privacy_section_contact_title: {
    ru: "Контакты",
    en: "Contact",
  },
  privacy_section_contact_body: {
    ru: "По вопросам работы приложения и конфиденциальности:",
    en: "For questions about the app and privacy:",
  },
  privacy_contact_line_prefix: {
    ru: "E-mail:",
    en: "Email:",
  },

  drive_title: {
    ru: "Синхронизация с Google Диск",
    en: "Sync with Google Drive",
  },
  drive_nav_title: {
    ru: "Синхр. Google Диск",
    en: "Google Drive sync",
  },
  drive_description: {
    ru: "Сохранение и загрузка настроек в файле oni_calculator_settings.json на вашем Google Диске.",
    en: "Save and load settings in oni_calculator_settings.json on your Google Drive.",
  },
  drive_connect: { ru: "Подключить Google Диск", en: "Connect Google Drive" },
  drive_save_now: { ru: "Сохранить сейчас", en: "Save now" },
  drive_load: { ru: "Загрузить с Диска", en: "Load from Drive" },
  drive_sign_out: { ru: "Выйти", en: "Sign out" },
  drive_status_not_connected: { ru: "Не подключено", en: "Not connected" },
  drive_status_connected: { ru: "Google Диск подключён", en: "Google Drive connected" },
  drive_status_saving: { ru: "Сохранение на Диск…", en: "Saving to Drive…" },
  drive_status_saved: { ru: "Сохранено на Диск", en: "Saved to Drive" },
  drive_status_loading: { ru: "Загрузка с Диска…", en: "Loading from Drive…" },
  drive_status_loaded: { ru: "Загружено с Диска", en: "Loaded from Drive" },
  drive_status_synced: { ru: "Синхронизировано с Диском", en: "Synced with Drive" },
  drive_status_file_not_found: {
    ru: "Файл на Диске не найден",
    en: "File not found on Drive",
  },
  drive_status_signed_out: { ru: "Вы вышли", en: "Signed out" },
  drive_status_waiting_sign_in: { ru: "Ожидание входа…", en: "Waiting to sign in…" },
  drive_error_label: { ru: "Ошибка", en: "Error" },
  drive_error_modal_title: {
    ru: "Ошибка синхронизации с Google Диск",
    en: "Google Drive sync error",
  },
  drive_error_show_detail: {
    ru: "Показать текст ошибки Google Диска",
    en: "Show Google Drive error details",
  },
  drive_error_service_response: { ru: "Ответ сервиса", en: "Service response" },
  drive_error_ok: { ru: "Понятно", en: "OK" },
  drive_error_auth: {
    ru: "Ошибка авторизации: {{detail}}",
    en: "Authorization error: {{detail}}",
  },
  drive_error_api_load_failed: {
    ru: "Не удалось загрузить Google API",
    en: "Failed to load Google API",
  },
  drive_error_api_not_ready: {
    ru: "Google API ещё не загружен",
    en: "Google API is not ready yet",
  },
  drive_error_token_missing: {
    ru: "Токен не получен",
    en: "No access token received",
  },
  drive_error_unknown: { ru: "Неизвестная ошибка", en: "Unknown error" },
  aria_drive_settings: {
    ru: "Настройки Google Диска",
    en: "Google Drive settings",
  },
  boot_loading: { ru: "Загрузка…", en: "Loading…" },
  boot_connecting_google: { ru: "Подключение к Google…", en: "Connecting to Google…" },
  boot_loading_from_drive: {
    ru: "Загрузка с Google Диск…",
    en: "Loading from Google Drive…",
  },

  food_tab_food: { ru: "Еда", en: "Food" },
  food_tab_info: { ru: "Инфо", en: "Info" },
  food_resource_info_tooltip: {
    ru: "Значения ресурсов даны за цикл. Сначала считается спрос по калориям, растения округляются вверх до целых, затем по фактическому числу растений пересчитывается производимая еда.",
    en: "Resource values are per cycle. Demand is calculated from calories first, plants are rounded up to whole numbers, then produced food is recalculated from the actual plant count.",
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
  settings_tab_planetoids: { ru: "Планетойд", en: "Planetoid" },
  planetoids_intro: {
    ru: "Планетойд - отдельная колония: дупликанты и (для Spaced Out) звёздная карта хранятся для выбранного планетойда.",
    en: "A planetoid is a separate colony: duplicants and (for Spaced Out) the star map are stored per selected planetoid.",
  },
  planetoid_type_spaced_out: { ru: "Spaced Out", en: "Spaced Out" },
  planetoid_pick_type_intro: {
    ru: "Создайте планетойд или выберите классическую игру или Spaced Out:",
    en: "Create a planetoid or choose Classic or Spaced Out:",
  },
  planetoid_pick_type_intro_before_link: {
    ru: "Создайте ",
    en: "Create a ",
  },
  planetoid_pick_type_intro_planetoid_word: {
    ru: "планетойд",
    en: "planetoid",
  },
  planetoid_pick_type_intro_after_link: {
    ru: " или выберите классическую игру или Spaced Out:",
    en: " or choose Classic or Spaced Out:",
  },
  planetoids_pick_type_intro: {
    ru: "Выберите классическую игру или Spaced Out:",
    en: "Choose Classic or Spaced Out:",
  },
  planetoid_finish_setup_intro: {
    ru: "Тип игры выбран. Укажите название планетойда, чтобы сохранить колонию, ракеты и настройки в браузере.",
    en: "Game type selected. Name your planetoid to save colony data, rockets, and settings in the browser.",
  },
  planetoid_finish_setup_button: {
    ru: "Настроить планетойд",
    en: "Set up planetoid",
  },
  planetoid_type_classic: { ru: "Классический", en: "Classic" },
  planetoid_expansions_label: { ru: "Дополнения", en: "Expansions" },
  planetoid_expansions_short: { ru: "Дополнения", en: "DLC" },
  planetoid_current: { ru: "Текущий", en: "Current" },
  planetoid_current_short: { ru: "текущий", en: "active" },
  planetoid_select: { ru: "Выбрать", en: "Select" },
  planetoid_duplicants_on_card: {
    ru: "Дупликантов: {{count}}",
    en: "Duplicants: {{count}}",
  },
  planetoid_duplicants_summary: {
    ru: "Дупликантов: {{count}}",
    en: "Duplicants: {{count}}",
  },
  planetoid_rockets_summary: {
    ru: "Ракет: {{count}}",
    en: "Rockets: {{count}}",
  },
  planetoid_total_label: { ru: "планетойдов", en: "planetoids" },
  aria_add_planetoid: { ru: "Добавить планетойд", en: "Add planetoid" },
  planetoid_add_title: { ru: "Новый планетойд", en: "New planetoid" },
  planetoid_name_label: { ru: "Название", en: "Name" },
  planetoid_name_placeholder: { ru: "Например, Rime", en: "e.g. Rime" },
  planetoid_default_name: {
    ru: "Планетойд {{n}}",
    en: "Planetoid {{n}}",
  },
  planetoid_type_label: { ru: "Тип", en: "Type" },
  planetoid_add_button: { ru: "Добавить планетойд", en: "Add planetoid" },
  onboarding_welcome_title: {
    ru: "Добро пожаловать в Simple ONI Calculator",
    en: "Welcome to Simple ONI Calculator",
  },
  onboarding_welcome_intro: {
    ru: "Simple ONI Calculator поможет планировать колонию. Создайте первый планетойд - для него сохранятся дупликанты, ракеты и звёздная карта.",
    en: "Simple ONI Calculator helps you plan your colony. Create your first planetoid - duplicants, rockets, and the star map will be stored for it.",
  },
  onboarding_start_button: { ru: "Начать", en: "Get started" },
  planetoid_edit_title: { ru: "Изменить планетоид", en: "Edit planetoid" },
  planetoid_delete_confirm: {
    ru: "Удалить планетоид «{{name}}»? Данные колонии будут потеряны.",
    en: 'Delete planetoid "{{name}}"? Colony data will be lost.',
  },
  aria_edit_planetoid: { ru: "Изменить планетоид", en: "Edit planetoid" },
  aria_delete_planetoid: { ru: "Удалить планетоид", en: "Delete planetoid" },
  planetoid_active_hint: {
    ru: "Сейчас активен: {{name}}. Дупликанты и карта относятся к этому планетойду.",
    en: "Active: {{name}}. Duplicants and map belong to this planetoid.",
  },
  planetoid_unnamed: { ru: "Планетойд", en: "Planetoid" },
  aria_current_planetoid: {
    ru: "Текущий планетойд: {{name}}",
    en: "Current planetoid: {{name}}",
  },
  rocket_page_coming_soon: {
    ru: "Раздел ракет будет реализован в скором будущем.",
    en: "The rockets section will be available soon.",
  },
  rocket_need_planetoid_before: {
    ru: "Чтобы пользоваться калькулятором ракеты, сначала создайте планетойд в разделе ",
    en: "To use the rocket calculator, create a planetoid first in ",
  },
  rocket_need_planetoid_link: {
    ru: "Планетойд",
    en: "Planetoid",
  },
  rocket_need_planetoid_after: {
    ru: ".",
    en: ".",
  },
  rocket_name_label: { ru: "Название ракеты", en: "Rocket name" },
  rocket_route_one_way_warning: {
    ru: "Путь в один конец: маршрут заканчивается не на центральной клетке карты.",
    en: "One-way route: the path does not end on the map center cell.",
  },
  rocket_section_fuel: { ru: "Топливо", en: "Fuel" },
  rocket_fuel_tank_insufficient: {
    ru: "На текущий маршрут встроенного бака этого двигателя не хватает - выберите другой двигатель или укоротите путь.",
    en: "This engine's integrated tank is too small for the current route - pick another engine or shorten the path.",
  },
  rocket_fuel_route_hint: {
    ru: "Укажите маршрут из минимум двух клеток - тогда появится расчёт баков.",
    en: "Draw a route of at least two cells - then tank calculations will appear.",
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
    en: "Installed modules do not affect flight range - only speed.",
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
    ru: "Элементов пока нет - добавьте их в ",
    en: "No items yet - add them to ",
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
    ru: "ЛКМ - продолжить маршрут от текущего конца (если маршрута нет - от центра карты). ПКМ - новый маршрут от центра до выбранной клетки.",
    en: "Left click - extend the route from the current end (if there is no route yet, from the map center). Right click - new route from the center to the selected cell.",
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
  star_map_type_planet: { ru: "Планетойд", en: "Planetoid" },
  star_map_type_wreck: { ru: "Обломок", en: "Wreck" },
  star_map_type_nebula: { ru: "Туманность", en: "Nebula" },
  star_map_main_short: { ru: "основная", en: "home" },
  star_map_cell_coords: {
    ru: "Клетка {{cell}} · q {{q}}, r {{r}}",
    en: "Cell {{cell}} · q {{q}}, r {{r}}",
  },
  star_map_hex_coords: {
    ru: "q {{q}}, r {{r}}",
    en: "q {{q}}, r {{r}}",
  },
  star_map_empty_catalog: {
    ru: "На карте пока нет объектов - откройте редактор и добавьте планеты, туманности или обломки.",
    en: "No objects on the map yet - open the editor to add planets, nebulae, or wrecks.",
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
  aria_clear_search: { ru: "Очистить поиск", en: "Clear search" },
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
