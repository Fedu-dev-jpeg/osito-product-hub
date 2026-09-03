import { MessageCircle } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import { track, useShop } from "@/lib/shop-store";
import { whatsappUrl, type WhatsAppContext } from "@/lib/whatsapp";

function contextFromPath(pathname: string, search: string): WhatsAppContext {
  if (pathname.startsWith("/lista-escolar")) return { kind: "school" };
  if (pathname.startsWith("/productos/") && pathname !== "/productos/") {
    const slug = decodeURIComponent(pathname.replace("/productos/", "").split("/")[0] ?? "");
    return slug ? { kind: "product", name: slug.replace(/-/g, " ") } : { kind: "home" };
  }
  if (pathname === "/" && search.includes("sucursal=")) {
    const params = new URLSearchParams(search.replace(/^\?/, ""));
    const address = params.get("sucursal");
    if (address) return { kind: "branch", address };
  }
  return { kind: "home" };
}

export function WhatsAppFloat({ context }: { context?: WhatsAppContext }) {
  const { settings } = useShop();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.searchStr });
  if (pathname.startsWith("/admin") || pathname.startsWith("/vendedor") || pathname.startsWith("/auth")) {
    return null;
  }
  const resolved = context ?? contextFromPath(pathname, search);
  const href = whatsappUrl(resolved, settings.whatsapp);

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Consultar por WhatsApp"
      onClick={() => track("click_whatsapp", { page: pathname, kind: resolved.kind })}
      className="fixed bottom-[4.75rem] right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#128C7E] text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold md:bottom-6 md:right-6 md:h-14 md:w-14"
    >
      <MessageCircle size={22} strokeWidth={1.8} />
    </a>
  );
}

export function MobileStickyCta() {
  const { settings } = useShop();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname.startsWith("/admin") || pathname.startsWith("/vendedor") || pathname.startsWith("/auth")) {
    return null;
  }
  const href = whatsappUrl({ kind: "home" }, settings.whatsapp);

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-background/95 px-3 py-2 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-[1280px] gap-2">
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("click_whatsapp", { page: pathname, source: "sticky" })}
          className="ui-text flex h-11 flex-1 items-center justify-center rounded-sm bg-primary px-3 text-[12px] uppercase tracking-[0.08em] text-primary-foreground"
        >
          Consultar por WhatsApp
        </a>
        <a
          href="/sucursales"
          className="ui-text flex h-11 flex-1 items-center justify-center rounded-sm border border-ink/20 px-3 text-[12px] uppercase tracking-[0.08em] text-ink"
        >
          Ver sucursales
        </a>
      </div>
    </div>
  );
}
