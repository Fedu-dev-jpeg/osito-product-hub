import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ProductManager } from "@/components/callao/ProductManager";
import { RequireAuth } from "@/components/callao/RequireAuth";
import { pageShell } from "@/components/callao/data";
import { useAuth } from "@/lib/auth";
import { getSettings, saveSettings, useShop, type Settings } from "@/lib/shop-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin | Librería Callao" },
      {
        name: "description",
        content: "Panel de administración de productos y configuración de Librería Callao.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  return (
    <RequireAuth role="admin">
      <AdminDashboard />
    </RequireAuth>
  );
}

function AdminDashboard() {
  const { stats } = useShop();
  const { profile, signOut } = useAuth();
  const [settings, setSettings] = useState<Settings>(() => getSettings());
  const [message, setMessage] = useState("");

  const statEntries = Object.entries(stats).filter(
    ([key, value]) => key !== "lastEvent" && typeof value === "number",
  ) as [string, number][];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className={`${pageShell} py-8 md:py-10`}>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-5 border-b border-rule pb-6">
          <div>
            <p className="ui-text mb-2 text-[11px] uppercase tracking-[0.2em] text-gold">
              Panel de administración
            </p>
            <h1 className="font-display text-4xl font-normal text-ink">Librería Callao</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Solo el admin publica en la tienda. {profile?.email}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/vendedor"
              className="ui-text rounded-sm border border-primary px-4 py-2.5 text-[13px] text-primary"
            >
              Panel vendedor
            </Link>
            <Link
              to="/"
              className="ui-text rounded-sm border border-primary px-4 py-2.5 text-[13px] text-primary"
            >
              Ver tienda
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className="ui-text rounded-sm bg-primary px-4 py-2.5 text-[13px] uppercase tracking-[0.08em] text-primary-foreground"
            >
              Salir
            </button>
          </div>
        </div>

        {message ? (
          <p className="ui-text mb-4 rounded-sm border border-gold/50 bg-secondary px-4 py-2.5 text-[13px] text-ink">
            {message}
          </p>
        ) : null}

        <ProductManager canPublish />

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <section className="rounded-md border border-rule bg-card p-5 md:p-6">
            <h2 className="mb-5 font-display text-2xl font-semibold text-ink">
              Debug de clics (ACM)
            </h2>
            {statEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía no hay eventos registrados.</p>
            ) : (
              <dl className="grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-2">
                {statEntries.map(([event, count]) => (
                  <div key={event} className="contents">
                    <dt className="ui-text text-[13px] font-semibold tabular-nums text-primary">
                      {count}
                    </dt>
                    <dd className="ui-text text-[13px] text-foreground">{event}</dd>
                  </div>
                ))}
              </dl>
            )}
            {stats.lastEvent ? (
              <p className="ui-text mt-4 border-t border-rule pt-3 text-[12px] text-muted-foreground">
                Último evento: <strong className="text-ink">{stats.lastEvent.eventName}</strong>
              </p>
            ) : null}
          </section>

          <section className="rounded-md border border-rule bg-card p-5 md:p-6">
            <h2 className="mb-5 font-display text-2xl font-semibold text-ink">Configuración</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveSettings({
                  ...settings,
                  freeShippingFrom: Number(settings.freeShippingFrom) || 0,
                });
                setMessage("Configuración guardada.");
              }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              {(
                [
                  ["whatsapp", "WhatsApp"],
                  ["freeShippingFrom", "Envío sin cargo desde (ARS)"],
                  ["googleAnalyticsId", "Google Analytics ID"],
                  ["metaPixelId", "Meta Pixel ID"],
                  ["campaignName", "Campaña"],
                  ["campaignBudget", "Presupuesto de campaña"],
                  ["campaignAudience", "Audiencia"],
                ] as [keyof Settings, string][]
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="ui-text flex flex-col gap-1.5 text-[13px] text-foreground"
                >
                  {label}
                  <input
                    value={settings[key]}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        [key]: key === "freeShippingFrom" ? Number(e.target.value) : e.target.value,
                      })
                    }
                    className="h-10 rounded-sm border border-ink/25 bg-background px-3 text-sm text-ink outline-none focus:border-gold"
                  />
                </label>
              ))}
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="ui-text rounded-sm bg-primary px-5 py-2.5 text-[13px] uppercase tracking-[0.08em] text-primary-foreground"
                >
                  Guardar configuración
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
