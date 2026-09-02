import { useEffect } from "react";
import { useShop } from "@/lib/shop-store";

function ensureScript(id: string, src: string) {
  if (document.getElementById(id)) return;
  const el = document.createElement("script");
  el.id = id;
  el.async = true;
  el.src = src;
  document.head.appendChild(el);
}

export function AnalyticsScripts() {
  const { settings } = useShop();
  useEffect(() => {
    const gaId = settings.googleAnalyticsId.trim();
    const pixelId = settings.metaPixelId.trim();

    if (gaId) {
      ensureScript(
        "callao-ga-src",
        `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`,
      );
      const w = window as Window & {
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
      };
      w.dataLayer = w.dataLayer ?? [];
      w.gtag = (...args: unknown[]) => {
        w.dataLayer?.push(args);
      };
      w.gtag("js", new Date());
      w.gtag("config", gaId);
    }

    if (pixelId) {
      const w = window as Window & {
        fbq?: ((...args: unknown[]) => void) & {
          queue?: unknown[];
          loaded?: boolean;
          version?: string;
        };
        _fbq?: unknown;
      };
      if (!w.fbq) {
        const fbq = ((...args: unknown[]) => {
          (fbq.queue = fbq.queue ?? []).push(args);
        }) as NonNullable<(typeof w)["fbq"]>;
        fbq.queue = [];
        fbq.loaded = true;
        fbq.version = "2.0";
        w.fbq = fbq;
        w._fbq = fbq;
        ensureScript("callao-meta-pixel", "https://connect.facebook.net/en_US/fbevents.js");
      }
      w.fbq?.("init", pixelId);
      w.fbq?.("track", "PageView");
    }
  }, [settings.googleAnalyticsId, settings.metaPixelId]);

  return null;
}
