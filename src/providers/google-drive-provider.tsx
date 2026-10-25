import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GOOGLE_CLIENT_ID } from "../google-drive/config";
import {
  type DriveStatusMessage,
  driveIdleStatus,
  driveMsg,
} from "../google-drive/driveStatus";
import {
  persistFileId,
  persistToken,
  persistUserEmail,
  readStoredToken,
  readStoredUserEmail,
} from "../google-drive/tokenStorage";
import { fetchGoogleAccountEmail } from "../google-drive/userinfo";

const OAUTH_SCOPE =
  "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email";
const GIS_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

type GisTokenResponse = {
  access_token?: string;
  error?: string;
};

type TokenRequestOverrides = {
  prompt?: string;
  login_hint?: string;
};

type TokenClient = {
  requestAccessToken: (overrides?: TokenRequestOverrides) => void;
};

type GisOAuthError = {
  type?: string;
  message?: string;
};

type GoogleAccountsOAuth2 = {
  initTokenClient: (config: {
    client_id: string;
    scope: string;
    login_hint?: string;
    callback: (response: GisTokenResponse) => void;
    error_callback?: (error: GisOAuthError) => void;
  }) => TokenClient;
};

function isAuthCancelled(errorCode?: string, message?: string): boolean {
  const code = (errorCode ?? "").toLowerCase();
  const text = (message ?? "").toLowerCase();
  return (
    code === "popup_closed" ||
    code === "popup_failed_to_open" ||
    code === "access_denied" ||
    text.includes("popup") ||
    text.includes("closed") ||
    text.includes("cancel")
  );
}

declare global {
  interface Window {
    google?: { accounts: { oauth2: GoogleAccountsOAuth2 } };
  }
}

export type GoogleDriveSyncStatus = "idle" | "loading" | "success" | "error";

type AuthMode = "silent" | "interactive";

type PendingAuth = {
  mode: AuthMode;
  resolve: (token: string) => void;
  reject: (errorCode?: string, message?: string) => void;
};

export type GoogleDriveContextValue = {
  accessToken: string | null;
  gisReady: boolean;
  status: GoogleDriveSyncStatus;
  statusMessage: DriveStatusMessage;
  setDriveStatus: (status: GoogleDriveSyncStatus, message: DriveStatusMessage) => void;
  /**
   * Возвращает сохранённый access token без GIS.
   * С `force: true` — тихий запрос нового токена (после 401/403 от Drive API).
   */
  ensureAccessToken: (options?: { force?: boolean }) => Promise<string | null>;
  connect: () => void;
  disconnect: () => void;
};

const GoogleDriveContext = createContext<GoogleDriveContextValue | null>(null);

export function useGoogleDrive(): GoogleDriveContextValue {
  const ctx = useContext(GoogleDriveContext);
  if (!ctx) {
    throw new Error("useGoogleDrive must be used within GoogleDriveProvider");
  }
  return ctx;
}

export default function GoogleDriveProvider({ children }: { children: React.ReactNode }) {
  const [gisReady, setGisReady] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(() => readStoredToken());
  const [status, setStatus] = useState<GoogleDriveSyncStatus>("idle");
  const [statusMessage, setStatusMessage] = useState<DriveStatusMessage>(() =>
    driveIdleStatus(Boolean(readStoredToken())),
  );
  const [loginHint, setLoginHint] = useState<string | null>(() => readStoredUserEmail());

  const tokenClientRef = useRef<TokenClient | null>(null);
  const authWaitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingAuthRef = useRef<PendingAuth | null>(null);
  const silentAuthInFlightRef = useRef<Promise<string | null> | null>(null);

  const clearAuthWaitTimeout = useCallback(() => {
    if (authWaitTimeoutRef.current) {
      clearTimeout(authWaitTimeoutRef.current);
      authWaitTimeoutRef.current = null;
    }
  }, []);

  const setDriveStatus = useCallback((next: GoogleDriveSyncStatus, message: DriveStatusMessage) => {
    setStatus(next);
    setStatusMessage(message);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SCRIPT_SRC}"]`);

    const onReady = () => {
      if (!cancelled && window.google?.accounts?.oauth2) setGisReady(true);
    };

    if (existing) {
      if (window.google?.accounts?.oauth2) onReady();
      else existing.addEventListener("load", onReady);
      return () => {
        cancelled = true;
        existing.removeEventListener("load", onReady);
      };
    }

    const script = document.createElement("script");
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = onReady;
    script.onerror = () => {
      if (!cancelled) setDriveStatus("error", driveMsg("drive_error_api_load_failed"));
    };
    document.body.appendChild(script);
    return () => {
      cancelled = true;
    };
  }, [setDriveStatus]);

  const finishAuthWait = useCallback(
    (next: GoogleDriveSyncStatus, message: DriveStatusMessage) => {
      clearAuthWaitTimeout();
      setDriveStatus(next, message);
    },
    [clearAuthWaitTimeout, setDriveStatus]
  );

  const handleAuthFailure = useCallback(
    (errorCode?: string, message?: string) => {
      const hasToken = Boolean(readStoredToken());
      if (isAuthCancelled(errorCode, message)) {
        finishAuthWait("idle", driveIdleStatus(hasToken));
        return;
      }
      const detail = message || errorCode;
      if (!detail) {
        finishAuthWait("error", driveMsg("drive_error_unknown"));
        return;
      }
      finishAuthWait("error", driveMsg("drive_error_auth", { detail }));
    },
    [finishAuthWait]
  );

  const syncUserEmail = useCallback(async (token: string, refresh: boolean) => {
    if (!refresh && readStoredUserEmail()) return;
    const email = await fetchGoogleAccountEmail(token);
    if (!email) return;
    persistUserEmail(email);
    setLoginHint(email);
  }, []);

  const completePendingAuth = useCallback(
    (token: string) => {
      const pending = pendingAuthRef.current;
      pendingAuthRef.current = null;
      clearAuthWaitTimeout();
      persistToken(token);
      setAccessToken(token);
      void syncUserEmail(token, pending?.mode === "interactive");
      pending?.resolve(token);
      if (pending?.mode === "interactive") {
        setDriveStatus("success", driveMsg("drive_status_connected"));
      }
    },
    [clearAuthWaitTimeout, setDriveStatus, syncUserEmail]
  );

  const failPendingAuth = useCallback(
    (errorCode?: string, message?: string) => {
      const pending = pendingAuthRef.current;
      pendingAuthRef.current = null;
      if (pending?.mode === "silent") {
        persistToken(null);
        setAccessToken(null);
        pending.reject(errorCode, message);
        return;
      }
      handleAuthFailure(errorCode, message);
      pending?.reject(errorCode, message);
    },
    [handleAuthFailure]
  );

  useEffect(() => {
    if (!gisReady || !window.google?.accounts?.oauth2) return;

    tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: OAUTH_SCOPE,
      ...(loginHint ? { login_hint: loginHint } : {}),
      callback: (response) => {
        if (response.error) {
          failPendingAuth(response.error);
          return;
        }
        if (!response.access_token) {
          const pending = pendingAuthRef.current;
          pendingAuthRef.current = null;
          clearAuthWaitTimeout();
          pending?.reject();
          finishAuthWait("error", driveMsg("drive_error_token_missing"));
          return;
        }
        completePendingAuth(response.access_token);
      },
      error_callback: (error) => {
        failPendingAuth(error.type, error.message);
      },
    });
  }, [gisReady, loginHint, completePendingAuth, failPendingAuth]);

  useEffect(() => {
    const token = readStoredToken();
    if (!token || readStoredUserEmail()) return;
    void syncUserEmail(token, true);
  }, [syncUserEmail]);

  useEffect(() => () => clearAuthWaitTimeout(), [clearAuthWaitTimeout]);

  const requestAccessToken = useCallback(
    (mode: AuthMode): Promise<string | null> => {
      if (!tokenClientRef.current) {
        if (mode === "interactive") {
          setDriveStatus("error", driveMsg("drive_error_api_not_ready"));
        }
        return Promise.resolve(null);
      }

      if (mode === "silent" && silentAuthInFlightRef.current) {
        return silentAuthInFlightRef.current;
      }

      if (mode === "interactive") {
        clearAuthWaitTimeout();
        setDriveStatus("loading", driveMsg("drive_status_waiting_sign_in"));
        authWaitTimeoutRef.current = setTimeout(() => {
          authWaitTimeoutRef.current = null;
          if (pendingAuthRef.current?.mode === "interactive") {
            pendingAuthRef.current = null;
          }
          setDriveStatus("idle", driveIdleStatus(Boolean(readStoredToken())));
        }, 120_000);
      }

      const promise = new Promise<string | null>((resolve) => {
        pendingAuthRef.current = {
          mode,
          resolve: (token) => resolve(token),
          reject: () => resolve(null),
        };
        const hint = readStoredUserEmail() ?? loginHint;
        const overrides: TokenRequestOverrides = {
          prompt: mode === "interactive" ? "consent" : "",
        };
        if (hint) overrides.login_hint = hint;
        tokenClientRef.current!.requestAccessToken(overrides);
      });

      if (mode === "silent") {
        silentAuthInFlightRef.current = promise.finally(() => {
          silentAuthInFlightRef.current = null;
        });
        return silentAuthInFlightRef.current;
      }

      return promise;
    },
    [setDriveStatus, clearAuthWaitTimeout, loginHint]
  );

  const ensureAccessToken = useCallback(
    async (options?: { force?: boolean }): Promise<string | null> => {
      const stored = readStoredToken();
      const token = stored ?? accessToken;
      if (!token) return null;

      if (!options?.force) return token;
      if (!gisReady) return token;

      return requestAccessToken("silent");
    },
    [gisReady, accessToken, requestAccessToken]
  );

  const connect = useCallback(() => {
    void requestAccessToken("interactive");
  }, [requestAccessToken]);

  const disconnect = useCallback(() => {
    clearAuthWaitTimeout();
    persistToken(null);
    persistFileId(null);
    persistUserEmail(null);
    setLoginHint(null);
    setAccessToken(null);
    setDriveStatus("idle", driveMsg("drive_status_signed_out"));
  }, [setDriveStatus, clearAuthWaitTimeout]);

  const value = useMemo(
    () => ({
      accessToken,
      gisReady,
      status,
      statusMessage,
      setDriveStatus,
      ensureAccessToken,
      connect,
      disconnect,
    }),
    [
      accessToken,
      gisReady,
      status,
      statusMessage,
      setDriveStatus,
      ensureAccessToken,
      connect,
      disconnect,
    ]
  );

  return <GoogleDriveContext.Provider value={value}>{children}</GoogleDriveContext.Provider>;
}
