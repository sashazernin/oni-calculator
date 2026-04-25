import type { z } from "zod";

export type ZodFieldErrorMap = Record<string, string>;

function issuePathToKey(path: readonly PropertyKey[]): string {
  if (path.length === 0) return "_root";
  return path
    .map((p) => (typeof p === "symbol" ? String(p.description ?? "symbol") : String(p)))
    .join(".");
}

/**
 * Собирает `ZodIssue[]` в объект `{ [поле]: сообщение }`.
 * Для одного пути оставляется первое сообщение.
 */
export function zodIssuesToFieldErrors(
  issues: ReadonlyArray<{ readonly path: readonly PropertyKey[]; message: string }>
): ZodFieldErrorMap {
  const out: ZodFieldErrorMap = {};
  for (const issue of issues) {
    const key = issuePathToKey(issue.path);
    if (out[key] === undefined) {
      out[key] = issue.message;
    }
  }
  return out;
}

/**
 * Проверяет значение по Zod-схеме.
 * @returns при успехе — `{ success: true, data }`, при ошибке — `{ success: false, errors }`,
 *          где `errors` имеет вид `{ fieldName: "сообщение", ... }` (для вложенных путей — `parent.child`).
 */
export function safeParseZodWithFieldErrors<S extends z.ZodType>(
  schema: S,
  value: unknown
):
  | { success: true; data: z.infer<S> }
  | { success: false; errors: ZodFieldErrorMap } {
  const result = schema.safeParse(value);
  if (result.success) {
    return { success: true as const, data: result.data };
  }
  return {
    success: false as const,
    errors: zodIssuesToFieldErrors(result.error.issues),
  };
}
