import { useEffect } from "react";
import { useCallao } from "./callao-store";

function clickLabel(target: EventTarget | null): string | null {
  if (!(target instanceof Element)) return null;
  const el = target.closest("a, button, input, summary, [role='button']");
  if (!(el instanceof HTMLElement)) return null;
  const text = (el.innerText || el.getAttribute("aria-label") || el.getAttribute("name") || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  const href = el instanceof HTMLAnchorElement ? el.getAttribute("href") : null;
  const tag = el.tagName.toLowerCase();
  return [tag, text, href].filter(Boolean).join(" · ");
}

export function ClickTracker() {
  const { trackClick } = useCallao();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const label = clickLabel(event.target);
      if (label) trackClick(label);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [trackClick]);

  return null;
}
