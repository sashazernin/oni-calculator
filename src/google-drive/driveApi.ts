import type { AppSettingsSnapshot } from "../helpers/appSettingsSnapshot";

export const SETTINGS_FILE_NAME = "oni_calculator_settings.json";

const DRIVE_API = "https://www.googleapis.com/drive/v3";

export function isDriveAuthError(message: string): boolean {
  return /\b(401|403)\b/.test(message);
}
const DRIVE_UPLOAD = "https://www.googleapis.com/upload/drive/v3";

function buildMultipartBody(metadata: Record<string, string>, jsonContent: string): {
  body: Blob;
  contentType: string;
} {
  const boundary = `oni_calc_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const parts =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: application/json\r\n\r\n` +
    `${jsonContent}\r\n` +
    `--${boundary}--`;
  return {
    body: new Blob([parts], { type: "multipart/related" }),
    contentType: `multipart/related; boundary=${boundary}`,
  };
}

export async function findSettingsFileId(accessToken: string): Promise<string | null> {
  const q = encodeURIComponent(`name='${SETTINGS_FILE_NAME}' and trashed=false`);
  const url = `${DRIVE_API}/files?q=${q}&fields=files(id,name)&pageSize=1`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Поиск файла: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { files?: { id: string }[] };
  return data.files?.[0]?.id ?? null;
}

export async function createSettingsFile(accessToken: string, jsonContent: string): Promise<string> {
  const { body, contentType } = buildMultipartBody(
    { name: SETTINGS_FILE_NAME, mimeType: "application/json" },
    jsonContent
  );
  const res = await fetch(`${DRIVE_UPLOAD}/files?uploadType=multipart`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": contentType,
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Создание файла: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { id?: string };
  if (!data.id) throw new Error("Создание файла: нет id в ответе");
  return data.id;
}

export async function updateSettingsFile(
  accessToken: string,
  fileId: string,
  jsonContent: string
): Promise<void> {
  const { body, contentType } = buildMultipartBody(
    { name: SETTINGS_FILE_NAME, mimeType: "application/json" },
    jsonContent
  );
  const res = await fetch(`${DRIVE_UPLOAD}/files/${fileId}?uploadType=multipart`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": contentType,
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Обновление файла: ${res.status} ${text}`);
  }
}

export async function downloadSettingsFile(accessToken: string, fileId: string): Promise<string> {
  const res = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Скачивание: ${res.status} ${text}`);
  }
  return res.text();
}

export function parseSettingsSnapshot(raw: string): AppSettingsSnapshot {
  const parsed = JSON.parse(raw) as AppSettingsSnapshot;
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Некорректный JSON настроек");
  }
  return parsed;
}

export async function uploadSettingsSnapshot(
  accessToken: string,
  fileId: string | null,
  jsonContent: string
): Promise<string> {
  let id = fileId;
  if (id) {
    try {
      await updateSettingsFile(accessToken, id, jsonContent);
      return id;
    } catch {
      id = null;
    }
  }
  if (!id) {
    id = await findSettingsFileId(accessToken);
  }
  if (id) {
    await updateSettingsFile(accessToken, id, jsonContent);
    return id;
  }
  return createSettingsFile(accessToken, jsonContent);
}
