import { createContext, useContext } from "react";
import type { PlanetoidGameType } from "../../types/planetoid-types";
import { useAppSettings } from "../../providers/app-settings-provider";

const PlanetoidPreviewContext = createContext<PlanetoidGameType | null>(null);

/** Тип игры: сохранённый планетойд или локальный предпросмотр на странице (без глобального стейта). */
export function useEffectivePlanetoidGameType(): PlanetoidGameType | null {
  const { activePlanetoid } = useAppSettings();
  const preview = useContext(PlanetoidPreviewContext);
  return activePlanetoid?.gameType ?? preview;
}

export function PlanetoidPreviewProvider({
  preview,
  children,
}: {
  preview: PlanetoidGameType | null;
  children: React.ReactNode;
}) {
  return (
    <PlanetoidPreviewContext.Provider value={preview}>
      {children}
    </PlanetoidPreviewContext.Provider>
  );
}
