export function sanitizeText(value: unknown, max = 4000) {
  return String(value ?? "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function sanitizeMultiline(value: unknown, max = 8000) {
  return String(value ?? "")
    .replace(/[<>]/g, "")
    .replace(/\r/g, "")
    .trim()
    .slice(0, max);
}

export function sanitizeId(value: unknown) {
  const raw = String(value ?? "").trim();
  if (/^G-[A-Z0-9]+$/i.test(raw)) return raw.toUpperCase();
  if (/^\d{15,16}$/.test(raw)) return raw;
  return raw.replace(/[^\w.-]/g, "").slice(0, 32);
}
