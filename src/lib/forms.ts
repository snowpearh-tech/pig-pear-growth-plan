export function readString(formData: FormData, key: string): string {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

export function readOptionalString(
  formData: FormData,
  key: string,
): string | null {
  const value = readString(formData, key);
  return value ? value : null;
}

export function readNumber(formData: FormData, key: string): number {
  const raw = formData.get(key);
  return Number(raw ?? 0);
}

export function readCheckbox(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}
