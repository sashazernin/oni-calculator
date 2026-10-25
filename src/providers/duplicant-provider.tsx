import { createContext, useContext, useMemo } from "react";
import type { IDuplicate } from "../types/game-data-types";
import { useAppSettings } from "./app-settings-provider";

export type DuplicantContextValue = {
  duplicants: IDuplicate[];
  setDuplicants: (next: IDuplicate[]) => void;
};

export const DuplicantContext = createContext<DuplicantContextValue>({
  duplicants: [],
  setDuplicants: () => {},
});

export function useDuplicants() {
  return useContext(DuplicantContext);
}

export default function DuplicantProvider({ children }: { children: React.ReactNode }) {
  const { data, setDuplicants } = useAppSettings();

  const value = useMemo(
    () => ({ duplicants: data.duplicants, setDuplicants }),
    [data.duplicants, setDuplicants]
  );

  return (
    <DuplicantContext.Provider value={value}>
      {children}
    </DuplicantContext.Provider>
  );
}
