import { Link } from "@tanstack/react-router";

export type Crumb = {
  label: string;
  to?: string;
  search?: { q?: string; categoria?: string; marca?: string; sub?: string; sort?: string };
};

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Migas de pan" className="ui-text text-[12px] text-sepia">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1">
              {i > 0 ? <span className="px-1">/</span> : null}
              {last || !item.to ? (
                <span className={last ? "text-ink" : undefined}>{item.label}</span>
              ) : item.search ? (
                <Link
                  to={item.to}
                  search={item.search}
                  className="rounded-sm hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.label}
                </Link>
              ) : (
                <Link
                  to={item.to}
                  className="rounded-sm hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
