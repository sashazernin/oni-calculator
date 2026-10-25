import type { TranslationKey } from "../i18n/translations";

export type DriveStatusMessage =
  | { kind: "i18n"; key: TranslationKey; vars?: Record<string, string | number> }
  | { kind: "raw"; text: string };

export function driveMsg(
  key: TranslationKey,
  vars?: Record<string, string | number>,
): DriveStatusMessage {
  return { kind: "i18n", key, vars };
}

export function driveMsgRaw(text: string): DriveStatusMessage {
  return { kind: "raw", text };
}

export const DRIVE_STATUS_NOT_CONNECTED: DriveStatusMessage = driveMsg("drive_status_not_connected");

export function driveIdleStatus(hasToken: boolean): DriveStatusMessage {
  return hasToken ? driveMsg("drive_status_connected") : DRIVE_STATUS_NOT_CONNECTED;
}

export function formatDriveStatusMessage(
  message: DriveStatusMessage,
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string,
): string {
  if (message.kind === "raw") return message.text;
  return t(message.key, message.vars);
}
