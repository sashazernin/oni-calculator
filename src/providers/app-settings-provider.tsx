import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { HexMapObjectItem } from "../types/hex-map-types";
import type { IDuplicate } from "../types/game-data-types";
import type { Planetoid, PlanetoidGameType } from "../types/planetoid-types";
import {
  activeVisiblePlanetoid,
  createPlanetoid,
  ensureColonyPlanetoidState,
  removePlanetoidFromState,
  switchActivePlanetoid,
  updatePlanetoidInState,
} from "../helpers/planetoidStorage";
import {
  appSettingsDataToSnapshot,
  createEmptyAppSettingsData,
  hasLocalAppSettings,
  loadAppSettingsDataFromLocal,
  parseAppSettingsData,
  persistAppSettingsDataToLocal,
  type AppSettingsData,
} from "../helpers/appSettingsData";
import type { RocketsStoragePayload } from "../helpers/readStoredRockets";
import {
  DRIVE_STATUS_NOT_CONNECTED,
  driveMsg,
  driveMsgRaw,
} from "../google-drive/driveStatus";
import type { TranslationKey } from "../i18n/translations";
import type { ISupportedThemes } from "./app-theme-provider";
import type { ISupportedLanguages } from "./localization-provider";
import {
  downloadSettingsFile,
  findSettingsFileId,
  isDriveAuthError,
  parseSettingsSnapshot,
  uploadSettingsSnapshot,
} from "../google-drive/driveApi";
import { persistFileId, readStoredFileId, readStoredToken } from "../google-drive/tokenStorage";
import { useGoogleDrive } from "./google-drive-provider";
import AppBootLoader from "../components/app-boot/AppBootLoader";

const SAVE_DEBOUNCE_MS = 2000;

export type AppSettingsContextValue = {
  ready: boolean;
  data: AppSettingsData;
  activePlanetoid: Planetoid | null;
  setTheme: (theme: ISupportedThemes) => void;
  setLanguage: (language: ISupportedLanguages) => void;
  setDuplicants: (duplicants: IDuplicate[]) => void;
  setRockets: (payload: RocketsStoragePayload) => void;
  setStarMap: (objects: HexMapObjectItem[]) => void;
  setActivePlanetoidId: (id: string) => void;
  addPlanetoid: (name: string, gameType: PlanetoidGameType, expansions: boolean) => void;
  updatePlanetoid: (
    id: string,
    patch: Pick<Planetoid, "name" | "gameType" | "expansions">
  ) => void;
  removePlanetoid: (id: string) => void;
  flushToCloud: () => Promise<void>;
  reloadFromCloud: () => Promise<void>;
};

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

export function useAppSettings(): AppSettingsContextValue {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) {
    throw new Error("useAppSettings must be used within AppSettingsProvider");
  }
  return ctx;
}

async function fetchSnapshotFromDrive(accessToken: string) {
  let fileId = readStoredFileId();
  if (!fileId) fileId = await findSettingsFileId(accessToken);
  if (!fileId) return null;
  persistFileId(fileId);
  const raw = await downloadSettingsFile(accessToken, fileId);
  return parseSettingsSnapshot(raw);
}

export default function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, gisReady, setDriveStatus, ensureAccessToken } = useGoogleDrive();
  const [data, setData] = useState<AppSettingsData>(() => createEmptyAppSettingsData());
  const [ready, setReady] = useState(false);
  const [bootMessageKey, setBootMessageKey] = useState<TranslationKey>("boot_loading");

  const accessTokenRef = useRef(accessToken);
  const dataRef = useRef(data);
  const skipPersistRef = useRef(true);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveInFlightRef = useRef(false);
  const hydrateGenRef = useRef(0);

  accessTokenRef.current = accessToken;
  dataRef.current = data;

  const applyData = useCallback((next: AppSettingsData) => {
    skipPersistRef.current = true;
    dataRef.current = next;
    setData(next);
  }, []);

  const persistToCloud = useCallback(
    async (payload: AppSettingsData) => {
      if (saveInFlightRef.current) return;
      if (!accessTokenRef.current && !readStoredToken()) return;

      saveInFlightRef.current = true;
      setDriveStatus("loading", driveMsg("drive_status_saving"));
      try {
        const json = JSON.stringify(appSettingsDataToSnapshot(payload));
        const upload = async (token: string) => {
          const fileId = await uploadSettingsSnapshot(token, readStoredFileId(), json);
          persistFileId(fileId);
        };

        let token = await ensureAccessToken();
        if (!token) {
          setDriveStatus("idle", DRIVE_STATUS_NOT_CONNECTED);
          return;
        }
        try {
          await upload(token);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          if (!isDriveAuthError(msg)) throw e;
          token = await ensureAccessToken({ force: true });
          if (!token) throw e;
          await upload(token);
        }
        setDriveStatus("success", driveMsg("drive_status_saved"));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setDriveStatus("error", driveMsgRaw(msg));
      } finally {
        saveInFlightRef.current = false;
      }
    },
    [setDriveStatus, ensureAccessToken]
  );

  const flushToCloud = useCallback(async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    await persistToCloud(dataRef.current);
  }, [persistToCloud]);

  const schedulePersist = useCallback(() => {
    const token = accessTokenRef.current;
    const payload = dataRef.current;
    persistAppSettingsDataToLocal(payload);

    if (token || readStoredToken()) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveTimerRef.current = null;
        void persistToCloud(payload);
      }, SAVE_DEBOUNCE_MS);
    }
  }, [persistToCloud]);

  const patchData = useCallback((patch: Partial<AppSettingsData>) => {
    skipPersistRef.current = false;
    setData((prev) => {
      const next = { ...prev, ...patch };
      if (
        patch.duplicants !== undefined ||
        patch.starMap !== undefined ||
        patch.rockets !== undefined
      ) {
        const synced = ensureColonyPlanetoidState(
          { activePlanetoidId: next.activePlanetoidId, planetoids: next.planetoids },
          {
            duplicants: next.duplicants,
            starMap: next.starMap,
            rockets: next.rockets,
          }
        );
        next.planetoids = synced.planetoids;
        next.activePlanetoidId = synced.activePlanetoidId;
      }
      dataRef.current = next;
      return next;
    });
  }, []);

  const setActivePlanetoidId = useCallback((id: string) => {
    skipPersistRef.current = false;
    setData((prev) => {
      const switched = switchActivePlanetoid(
        { activePlanetoidId: prev.activePlanetoidId, planetoids: prev.planetoids },
        id,
        {
          duplicants: prev.duplicants,
          starMap: prev.starMap,
          rockets: prev.rockets,
        }
      );
      if (!switched) return prev;
      const active = switched.planetoids.find((p) => p.id === switched.activePlanetoidId);
      if (!active) return prev;
      const next: AppSettingsData = {
        ...prev,
        activePlanetoidId: switched.activePlanetoidId,
        planetoids: switched.planetoids,
        duplicants: active.duplicants,
        starMap: active.starMap,
        rockets: active.rockets,
      };
      dataRef.current = next;
      return next;
    });
  }, []);

  const addPlanetoid = useCallback(
    (name: string, gameType: PlanetoidGameType, expansions: boolean) => {
      skipPersistRef.current = false;
      setData((prev) => {
        const synced = ensureColonyPlanetoidState(
          { activePlanetoidId: prev.activePlanetoidId, planetoids: prev.planetoids },
          {
            duplicants: prev.duplicants,
            starMap: prev.starMap,
            rockets: prev.rockets,
          }
        );
        const created = createPlanetoid(name, gameType, expansions);
        const withoutHidden = synced.planetoids.filter((p) => !p.hidden);
        const isFirstVisible = withoutHidden.length === 0;
        const firstColony = isFirstVisible
          ? {
              ...created,
              duplicants: prev.duplicants,
              starMap: prev.starMap,
              rockets: prev.rockets,
            }
          : created;
        const planetoids = [...withoutHidden, firstColony];
        const next: AppSettingsData = {
          ...prev,
          activePlanetoidId: firstColony.id,
          planetoids,
          duplicants: firstColony.duplicants,
          starMap: firstColony.starMap,
          rockets: firstColony.rockets,
        };
        dataRef.current = next;
        return next;
      });
    },
    []
  );

  const updatePlanetoid = useCallback(
    (id: string, patch: Pick<Planetoid, "name" | "gameType" | "expansions">) => {
      skipPersistRef.current = false;
      setData((prev) => {
        const updated = updatePlanetoidInState(
          { activePlanetoidId: prev.activePlanetoidId, planetoids: prev.planetoids },
          id,
          patch
        );
        const next: AppSettingsData = { ...prev, planetoids: updated.planetoids };
        dataRef.current = next;
        return next;
      });
    },
    []
  );

  const removePlanetoid = useCallback((id: string) => {
    skipPersistRef.current = false;
    setData((prev) => {
      const removed = removePlanetoidFromState(
        { activePlanetoidId: prev.activePlanetoidId, planetoids: prev.planetoids },
        id,
        {
          duplicants: prev.duplicants,
          starMap: prev.starMap,
          rockets: prev.rockets,
        }
      );
      if (!removed) return prev;
      const active = removed.planetoids.find((p) => p.id === removed.activePlanetoidId);
      if (!active) return prev;
      const next: AppSettingsData = {
        ...prev,
        activePlanetoidId: removed.activePlanetoidId,
        planetoids: removed.planetoids,
        duplicants: active.duplicants,
        starMap: active.starMap,
        rockets: active.rockets,
      };
      dataRef.current = next;
      return next;
    });
  }, []);

  const prevTokenRef = useRef(accessToken);

  useEffect(() => {
    if (prevTokenRef.current && !accessToken) {
      persistAppSettingsDataToLocal(dataRef.current);
    }
    prevTokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    if (!ready || skipPersistRef.current) return;
    schedulePersist();
  }, [data, ready, schedulePersist]);

  useEffect(() => {
    if (ready) return;

    const gen = ++hydrateGenRef.current;
    let cancelled = false;
    const hadStoredSession = Boolean(accessToken);

    async function hydrate() {
      if (hadStoredSession && !gisReady) {
        setBootMessageKey("boot_connecting_google");
        return;
      }

      if (hadStoredSession && gisReady) {
        setBootMessageKey("boot_loading_from_drive");
        try {
          let token = await ensureAccessToken();
          if (cancelled || hydrateGenRef.current !== gen) return;
          if (token) {
            try {
              const snapshot = await fetchSnapshotFromDrive(token);
              if (cancelled || hydrateGenRef.current !== gen) return;
              if (snapshot) {
                applyData(parseAppSettingsData(snapshot));
                setReady(true);
                setDriveStatus("success", driveMsg("drive_status_synced"));
                return;
              }
              setDriveStatus("idle", driveMsg("drive_status_file_not_found"));
            } catch (e) {
              const msg = e instanceof Error ? e.message : String(e);
              if (isDriveAuthError(msg)) {
                token = await ensureAccessToken({ force: true });
                if (token) {
                  const snapshot = await fetchSnapshotFromDrive(token);
                  if (cancelled || hydrateGenRef.current !== gen) return;
                  if (snapshot) {
                    applyData(parseAppSettingsData(snapshot));
                    setReady(true);
                    setDriveStatus("success", driveMsg("drive_status_synced"));
                    return;
                  }
                }
              }
              if (cancelled || hydrateGenRef.current !== gen) return;
              setDriveStatus("error", driveMsgRaw(msg));
            }
          }
        } catch (e) {
          if (cancelled || hydrateGenRef.current !== gen) return;
          const msg = e instanceof Error ? e.message : String(e);
          setDriveStatus("error", driveMsgRaw(msg));
        }
      }

      if (cancelled || hydrateGenRef.current !== gen) return;
      setBootMessageKey("boot_loading");
      if (hasLocalAppSettings()) {
        applyData(loadAppSettingsDataFromLocal());
      } else {
        applyData(createEmptyAppSettingsData());
      }
      setReady(true);
      if (!hadStoredSession) {
        setDriveStatus("idle", DRIVE_STATUS_NOT_CONNECTED);
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [accessToken, gisReady, ready, applyData, setDriveStatus, ensureAccessToken]);

  const reloadFromCloud = useCallback(async () => {
    if (!accessTokenRef.current && !readStoredToken()) return;
    setDriveStatus("loading", driveMsg("drive_status_loading"));
    try {
      const load = async (token: string) => fetchSnapshotFromDrive(token);

      let token = await ensureAccessToken();
      if (!token) {
        setDriveStatus("idle", DRIVE_STATUS_NOT_CONNECTED);
        return;
      }
      let snapshot: Awaited<ReturnType<typeof fetchSnapshotFromDrive>>;
      try {
        snapshot = await load(token);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!isDriveAuthError(msg)) throw e;
        token = await ensureAccessToken({ force: true });
        if (!token) throw e;
        snapshot = await load(token);
      }
      if (!snapshot) {
        setDriveStatus("idle", driveMsg("drive_status_file_not_found"));
        return;
      }
      applyData(parseAppSettingsData(snapshot));
      setDriveStatus("success", driveMsg("drive_status_loaded"));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setDriveStatus("error", driveMsgRaw(msg));
    }
  }, [applyData, setDriveStatus, ensureAccessToken]);

  const setTheme = useCallback(
    (theme: ISupportedThemes) => patchData({ theme }),
    [patchData]
  );
  const setLanguage = useCallback(
    (language: ISupportedLanguages) => patchData({ language }),
    [patchData]
  );
  const setDuplicants = useCallback(
    (duplicants: IDuplicate[]) => patchData({ duplicants }),
    [patchData]
  );
  const setRockets = useCallback(
    (rockets: RocketsStoragePayload) => patchData({ rockets }),
    [patchData]
  );
  const setStarMap = useCallback(
    (starMap: HexMapObjectItem[]) => patchData({ starMap }),
    [patchData]
  );

  const activePlanetoid = useMemo(
    () => activeVisiblePlanetoid(data.activePlanetoidId, data.planetoids),
    [data.planetoids, data.activePlanetoidId]
  );

  const value = useMemo(
    () => ({
      ready,
      data,
      activePlanetoid,
      setTheme,
      setLanguage,
      setDuplicants,
      setRockets,
      setStarMap,
      setActivePlanetoidId,
      addPlanetoid,
      updatePlanetoid,
      removePlanetoid,
      flushToCloud,
      reloadFromCloud,
    }),
    [
      ready,
      data,
      activePlanetoid,
      setTheme,
      setLanguage,
      setDuplicants,
      setRockets,
      setStarMap,
      setActivePlanetoidId,
      addPlanetoid,
      updatePlanetoid,
      removePlanetoid,
      flushToCloud,
      reloadFromCloud,
    ]
  );

  if (!ready) {
    return <AppBootLoader messageKey={bootMessageKey} />;
  }

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}
