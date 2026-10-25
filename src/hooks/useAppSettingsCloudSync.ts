/**
 * Уведомляет облачную синхронизацию об изменении данных в localStorage.
 * Вызывайте после любого сохранения настроек приложения.
 */
let changeHandler: (() => void) | null = null;
let suppressDepth = 0;

export function registerAppSettingsChangeHandler(handler: (() => void) | null): void {
  changeHandler = handler;
}

export function notifyAppSettingsChanged(): void {
  if (suppressDepth > 0) return;
  changeHandler?.();
}

/** Подавляет авто-выгрузку при применении снимка с Диска. */
export function runWithCloudSyncSuppressed(fn: () => void): void {
  suppressDepth += 1;
  try {
    fn();
  } finally {
    suppressDepth -= 1;
  }
}

export function useAppSettingsCloudSync(): { notifyAppSettingsChanged: () => void } {
  return { notifyAppSettingsChanged };
}
