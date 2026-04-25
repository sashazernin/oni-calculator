import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { dupeSchema } from "../schemas/gameSchemas";
import type { IDuplicate } from "../types/game-data-types";

const DUPES_STORAGE_KEY = "oni-calculator:game-duplicants";

const dupeListSchema = z.array(dupeSchema);

function readStoredDuplicates(): IDuplicate[] {
  try {
    const raw = localStorage.getItem(DUPES_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    const r = dupeListSchema.safeParse(parsed);
    return r.success ? r.data : [];
  } catch {
    return [];
  }
}

export type DuplicantContextValue = {
  duplicants: IDuplicate[];
  /** Заменяет весь список; в `useEffect` он же синхронизируется в `localStorage`. */
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
  const [duplicants, setDuplicantsState] = useState<IDuplicate[]>(() => readStoredDuplicates());

  const setDuplicants = useCallback((next: IDuplicate[]) => {
    setDuplicantsState(next);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DUPES_STORAGE_KEY, JSON.stringify(duplicants));
    } catch {
      /* private mode, quota, … */
    }
  }, [duplicants]);

  const value = useMemo(
    () => ({ duplicants, setDuplicants }),
    [duplicants, setDuplicants]
  );

  return (
    <DuplicantContext.Provider value={value}>
      {children}
    </DuplicantContext.Provider>
  );
}
