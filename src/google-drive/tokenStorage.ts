export const TOKEN_STORAGE_KEY = "oni-calculator.google-drive.access-token";
export const FILE_ID_STORAGE_KEY = "oni-calculator.google-drive.file-id";
export const USER_EMAIL_STORAGE_KEY = "oni-calculator.google-drive.user-email";

export function readStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function persistToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    /* */
  }
}

export function readStoredFileId(): string | null {
  try {
    return localStorage.getItem(FILE_ID_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function readStoredUserEmail(): string | null {
  try {
    const email = localStorage.getItem(USER_EMAIL_STORAGE_KEY)?.trim();
    return email || null;
  } catch {
    return null;
  }
}

export function persistUserEmail(email: string | null): void {
  try {
    if (email) localStorage.setItem(USER_EMAIL_STORAGE_KEY, email);
    else localStorage.removeItem(USER_EMAIL_STORAGE_KEY);
  } catch {
    /* */
  }
}

export function persistFileId(fileId: string | null): void {
  try {
    if (fileId) localStorage.setItem(FILE_ID_STORAGE_KEY, fileId);
    else localStorage.removeItem(FILE_ID_STORAGE_KEY);
  } catch {
    /* */
  }
}
