import { useEffect, useRef, type DependencyList } from "react";
import { notifyAppSettingsChanged } from "./useAppSettingsCloudSync";

/**
 * После первого рендера вызывает notify при изменении зависимостей
 * (когда данные уже записаны в localStorage).
 */
export function usePersistedSettingsEffect(effectDeps: DependencyList): void {
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    notifyAppSettingsChanged();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- намеренно внешний список deps
  }, effectDeps);
}
