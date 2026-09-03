import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CatalogImport } from "@/components/callao/CatalogImport";
import { HeroManager } from "@/components/callao/HeroManager";
import { LocationManager } from "@/components/callao/LocationManager";
import { ProductManager } from "@/components/callao/ProductManager";
import { RequireAuth } from "@/components/callao/RequireAuth";
import { formatARS, pageShell } from "@/components/callao/data";
import { useAuth } from "@/lib/auth";
import { fetchManagedProducts, type ProductRow } from "@/lib/catalog";
import {
  fetchOrders,
  orderStatusLabel,
  setOrderStatus,
  type OrderRow,
  type OrderStatus,
} from "@/lib/orders";
import { catalogCategories, knownBrands, siteServices } from "@/lib/site";
import {
  fetchEventCounts,
  fetchSearchNoResults,
  saveSettings,
  useShop,
  type Settings,
} from "@/lib/shop-store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin | Librería Callao" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const tabs = [
  "Dashboard",
  "Productos",
  "Importar / Exportar",
  "Categorías",
  "Marcas",
  "Sucursales",
  "Servicios",
  "Banners",
  "Promociones",
  "Configuración",
  "Analytics",
] as const;

type Tab = (typeof tabs)[number];

function AdminPage() {
  return (
    <RequireAuth role="admin" loginTo="/admin/login">
      <AdminDashboard />
    </RequireAuth>
  );
}

function AdminDashboard() {
  const shop = useShop();
  const { stats, products, settings: storedSettings } = shop;
  const { profile, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("Dashboard");
  const [settings, setSettings] = useState<Settings>(storedSettings);

  useEffect(() => {
    setSettings(shop.settings);
  }, [shop.settings]);

  const [remoteCounts, setRemoteCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    void fetchEventCounts()
      .then(setRemoteCounts)
      .catch(() => undefined);
  }, []);

  const published = products.filter((p) => (p.inventory ?? 0) >= 0);
  const withoutStock = products.filter((p) => (p.inventory ?? 0) <= 0);
  const consulted = Object.entries(stats)
    .filter(([key, value]) => key === "click_whatsapp" || typeof value === "number")
    .filter(([key]) => key !== "lastEvent") as [string, number][];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className={`${pageShell} py-8 md:py-10`}>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-5 border-b border-rule pb-6">
          <div>
            <p className="ui-text mb-2 text-[11px] uppercase tracking-[0.2em] text-gold">
              Panel de administración
            </p>
            <h1 className="font-display text-4xl font-normal text-ink">Librería Callao</h1>
            <p className="mt-1 text-sm text-muted-foreground">{profile?.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/productos"
              className="ui-text rounded-sm border border-primary px-4 py-2.5 text-[13px] text-primary"
            >
              Ver sitio
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

        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`ui-text min-h-10 rounded-sm px-3 text-[12px] uppercase tracking-[0.08em] ${
                tab === item ? "bg-primary text-primary-foreground" : "border border-rule text-ink"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {tab === "Dashboard" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Productos activos" value={String(published.length)} />
            <Stat label="Sin stock" value={String(withoutStock.length)} />
            <Stat label="Clics WhatsApp" value={String(remoteCounts["click_whatsapp"] ?? stats["click_whatsapp"] ?? 0)} />
            <Stat label="Búsquedas" value={String(remoteCounts["search"] ?? stats["search"] ?? 0)} />
            <Stat label="Clics Maps" value={String(remoteCounts["click_maps"] ?? stats["click_maps"] ?? 0)} />
            <Stat label="Clics teléfono" value={String(remoteCounts["click_phone"] ?? stats["click_phone"] ?? 0)} />
            <Stat label="Listas escolares" value={String(remoteCounts["send_school_list"] ?? stats["send_school_list"] ?? 0)} />
            <Stat label="Clics sucursal" value={String(remoteCounts["select_store"] ?? stats["select_store"] ?? 0)} />
          </div>
        ) : null}

        {tab === "Productos" ? (
          <div>
            <ProductManager canPublish />
            <AdminOrders />
          </div>
        ) : null}

        {tab === "Categorías" ? (
          <section className="rounded-md border border-rule bg-card p-5">
            <h2 className="font-display text-2xl text-ink">Categorías del catálogo</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Estas categorías estructuran la web pública. Los productos se asignan al crearlos.
            </p>
            <ul className="mt-5 divide-y divide-rule">
              {catalogCategories.map((cat) => (
                <li key={cat.slug} className="py-3">
                  <p className="font-display text-lg text-ink">{cat.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {cat.subs.length ? cat.subs.join(" · ") : "Sin subcategorías fijas"}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {tab === "Marcas" ? (
          <section className="rounded-md border border-rule bg-card p-5">
            <h2 className="font-display text-2xl text-ink">Marcas</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Trabajamos con marcas como… La disponibilidad puede variar.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {knownBrands.map((brand) => (
                <span key={brand} className="rounded-sm border border-rule px-3 py-1.5 text-sm">
                  {brand}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {tab === "Importar / Exportar" ? <AdminImportExport /> : null}

        {tab === "Sucursales" ? <LocationManager /> : null}

        {tab === "Servicios" ? (
          <section className="rounded-md border border-rule bg-card p-5">
            <h2 className="font-display text-2xl text-ink">Servicios</h2>
            <ul className="mt-4 space-y-3">
              {siteServices.map((service) => (
                <li key={service.title}>
                  <p className="font-display text-lg text-ink">{service.title}</p>
                  <p className="text-sm text-muted-foreground">{service.text}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {tab === "Banners" ? <HeroManager /> : null}

        {tab === "Promociones" ? (
          <section className="rounded-md border border-rule bg-card p-5">
            <h2 className="font-display text-2xl text-ink">Promociones</h2>
            <p className="mt-2 max-w-[56ch] text-sm text-muted-foreground">
              No hay promociones, envíos ni financiación publicados hasta que se confirmen. Cuando haya
              una campaña real, cargala acá y en Configuración, sin inventar beneficios.
            </p>
          </section>
        ) : null}

        {tab === "Configuración" ? (
          <section className="rounded-md border border-rule bg-card p-5 md:p-6">
            <h2 className="mb-5 font-display text-2xl font-semibold text-ink">Configuración del sitio</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void saveSettings(settings)
                  .then(() => toast.success("Configuración guardada."))
                  .catch((err: unknown) =>
                    toast.error(err instanceof Error ? err.message : "No se pudo guardar."),
                  );
              }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              {(
                [
                  ["whatsapp", "WhatsApp (solo dígitos, con 549…)"],
                  ["email", "Email"],
                  ["instagramUrl", "Instagram URL"],
                  ["facebookUrl", "Facebook URL (solo si está confirmada)"],
                  ["googleReviewsUrl", "URL de reseñas de Google"],
                  ["googleAnalyticsId", "Google Analytics 4 ID"],
                  ["metaPixelId", "Meta Pixel ID"],
                  ["legalName", "Razón social"],
                  ["cuit", "CUIT"],
                  ["tagline", "Línea de marca"],
                  ["heroEyebrow", "Hero eyebrow"],
                  ["heroTitle", "Hero título"],
                ] as [keyof Settings, string][]
              ).map(([key, label]) => (
                <label key={key} className="ui-text flex flex-col gap-1.5 text-[13px] text-foreground">
                  {label}
                  <input
                    value={settings[key] ?? ""}
                    onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                    className="h-10 rounded-sm border border-ink/25 bg-background px-3 text-sm text-ink outline-none focus:border-gold"
                  />
                </label>
              ))}
              <label className="ui-text flex flex-col gap-1.5 text-[13px] text-foreground sm:col-span-2">
                Hero descripción
                <textarea
                  value={settings.heroDescription}
                  onChange={(e) => setSettings({ ...settings, heroDescription: e.target.value })}
                  rows={3}
                  className="rounded-sm border border-ink/25 bg-background px-3 py-2 text-sm"
                />
              </label>
              <p className="sm:col-span-2 text-xs text-muted-foreground">
                Si GA o Pixel están vacíos, no se inicializan. No cargues IDs de prueba inventados.
              </p>
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
        ) : null}

        {tab === "Analytics" ? (
          <section className="rounded-md border border-rule bg-card p-5">
            <h2 className="mb-4 font-display text-2xl text-ink">Analytics</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Eventos locales de este navegador y totales guardados en el servidor cuando el clic se
              registra.
            </p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              {consulted.map(([event, count]) => (
                <div key={event} className="contents">
                  <dt className="tabular-nums text-primary">{count}</dt>
                  <dd>{event}</dd>
                </div>
              ))}
            </dl>
            {shop.stats.lastEvent ? (
              <p className="mt-4 text-xs text-muted-foreground">
                Último: {shop.stats.lastEvent.eventName}
              </p>
            ) : null}
            <SearchNoResults />
          </section>
        ) : null}
      </div>
    </div>
  );
}

function AdminImportExport() {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const load = async () => {
    setStatus("loading");
    const data = await fetchManagedProducts();
    setRows(data);
    setStatus("ready");
  };

  useEffect(() => {
    void load().catch(() => setStatus("error"));
  }, []);

  if (status === "error") {
    return (
      <div className="rounded-md border border-rule bg-card p-5">
        <p className="font-display text-xl text-ink">No se pudo cargar el catálogo</p>
        <button
          type="button"
          onClick={() => void load().catch(() => setStatus("error"))}
          className="ui-text mt-3 rounded-sm border border-ink/20 px-4 py-2 text-[12px] uppercase tracking-[0.08em]"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      {status === "loading" ? (
        <p className="mb-4 text-sm text-muted-foreground">Cargando productos…</p>
      ) : null}
      <CatalogImport rows={rows} onReload={load} />
    </div>
  );
}

function SearchNoResults() {
  const [items, setItems] = useState<{ query: string; count: number }[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    void fetchSearchNoResults()
      .then((data) => {
        setItems(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="mt-8 border-t border-rule pt-6">
      <h3 className="font-display text-2xl text-ink">Búsquedas sin resultados</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Consultas reales del buscador que no devolvieron productos. No se guardan datos personales.
      </p>
      {status === "loading" ? <p className="mt-3 text-sm text-muted-foreground">Cargando…</p> : null}
      {status === "error" ? (
        <p className="mt-3 text-sm text-muted-foreground">No se pudieron leer las búsquedas.</p>
      ) : null}
      {status === "ready" && !items.length ? (
        <p className="mt-3 text-sm text-muted-foreground">Todavía no hay búsquedas sin resultado.</p>
      ) : null}
      {items.length ? (
        <ul className="mt-4 divide-y divide-rule">
          {items.map((item) => (
            <li key={item.query} className="flex items-center justify-between py-2 text-sm">
              <span>“{item.query}”</span>
              <span className="tabular-nums text-primary">{item.count}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-rule bg-card p-4">
      <p className="ui-text text-[11px] uppercase tracking-[0.14em] text-gold">{label}</p>
      <p className="mt-2 font-display text-3xl text-ink">{value}</p>
    </div>
  );
}

function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);

  const load = async () => {
    setOrders(await fetchOrders());
  };

  useEffect(() => {
    void load().catch((err: unknown) =>
      toast.error(err instanceof Error ? err.message : "No se pudieron cargar los pedidos."),
    );
  }, []);

  const unused = useMemo(() => formatARS, []);

  return (
    <section className="mt-5 rounded-md border border-rule bg-card p-5 md:p-6">
      <h2 className="mb-4 font-display text-2xl font-semibold text-ink">Pedidos ({orders.length})</h2>
      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay pedidos de clientes.</p>
      ) : (
        <ul className="divide-y divide-rule">
          {orders.map((order) => (
            <li key={order.id} className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg text-ink">{order.code}</p>
                <p className="ui-text text-[12px] text-muted-foreground">
                  {new Date(order.created_at).toLocaleString("es-AR")} · {unused(order.total)} ·{" "}
                  {order.fulfillment === "envio" ? "Envío" : "Retiro"}
                </p>
              </div>
              <select
                value={order.status}
                onChange={(e) => {
                  const status = e.target.value as OrderStatus;
                  void setOrderStatus(order.id, status)
                    .then(() => load())
                    .then(() => toast.success("Estado actualizado."))
                    .catch((err: unknown) =>
                      toast.error(err instanceof Error ? err.message : "No se pudo actualizar."),
                    );
                }}
                className="h-9 rounded-sm border border-ink/20 px-2 text-sm"
              >
                {Object.entries(orderStatusLabel).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
