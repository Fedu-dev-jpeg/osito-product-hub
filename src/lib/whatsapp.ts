import { DEFAULT_WHATSAPP } from "@/lib/site";

export type WhatsAppContext =
  | { kind: "home" }
  | { kind: "product"; name: string }
  | { kind: "school" }
  | { kind: "branch"; address: string }
  | { kind: "search"; query?: string }
  | { kind: "custom"; text: string };

export function whatsappDigits(value = "") {
  const digits = value.replace(/\D/g, "");
  if (!digits) return DEFAULT_WHATSAPP;
  if (digits.startsWith("549") && digits.length >= 12) return digits;
  if (digits.startsWith("54") && digits.length >= 11) return digits;
  if (digits.startsWith("11") && digits.length === 10) return `549${digits}`;
  if (digits.length === 8) return `54911${digits}`;
  return digits;
}

export function whatsappMessage(context: WhatsAppContext) {
  switch (context.kind) {
    case "home":
      return "Hola, quería hacer una consulta.";
    case "product":
      return `Hola, quería consultar disponibilidad y precio de ${context.name}.`;
    case "school":
      return "Hola, quería enviarles una lista escolar.";
    case "branch":
      return `Hola, quería consultar con la sucursal de ${context.address}.`;
    case "search":
      return context.query
        ? `Hola, busqué ‘${context.query}’ en la web y quería consultar si lo tienen.`
        : "Hola, quería consultar disponibilidad de un producto.";
    case "custom":
      return context.text;
  }
}

export function whatsappUrl(context: WhatsAppContext, number?: string) {
  const phone = whatsappDigits(number || DEFAULT_WHATSAPP);
  const text = encodeURIComponent(whatsappMessage(context));
  return `https://wa.me/${phone}?text=${text}`;
}
