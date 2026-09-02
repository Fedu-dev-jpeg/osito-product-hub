import { useEffect, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { formatARS, pageShell, productGroups, type Product } from "@/components/callao/data";
import { useCallao } from "@/components/callao/callao-store";
import { fileToDataUrl, newId, parsePrice, type Campaign } from "@/lib/callao-storage";

const emptyForm = {
  id: "",
  name: "",
  group: "Libros",
  category: "",
  description: "",
  price: "",
  badge: "",
  image: "",
};

function formatWhen(at: number) {
  return new Date(at).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "medium" });
}

export function AdminDashboard() {
  const {
    products,
    searches,
    cartAdds,
    subscriptions,
    adminEvents,
    lastEvent,
    events,
    settings,
    upsertProduct,
    deleteProduct,
    saveSettings,
    trackAdmin,
    ready,
  } = useCallao();

  const [tab, setTab] = useState<"productos" | "campanas" | "stats">("productos");
  const [form, setForm] = useState(emptyForm);
  const [campaign, setCampaign] = useState({
    name: "",
    source: "",
    medium: "",
    spend: "",
    notes: "",
  });
  const [gaId, setGaId] = useState(settings.gaId);
  const [metaPixelId, setMetaPixelId] = useState(settings.metaPixelId);

  useEffect(() => {
    if (!ready) return;
    setGaId(settings.gaId);
    setMetaPixelId(settings.metaPixelId);
  }, [ready, settings.gaId, settings.metaPixelId]);

  const editing = Boolean(form.id);

  const fillForm = (product: Product) => {
    setForm({
      id: product.id,
      name: product.name,
      group: product.group,
      category: product.category,
      description: product.description,
      price: String(product.price),
      badge: product.badge ?? "",
      image: product.image,
    });
    setTab("productos");
  };

  const onSaveProduct = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error("El nombre es obligatorio.");
      return;
    }
    const base: Product = {
      id: form.id || newId("p"),
      group: form.group,
      category: form.category.trim() || form.group,
      name: form.name.trim(),
      description: form.description.trim(),
      price: parsePrice(form.price),
      image:
        form.image ||
        "data:image/svg+xml," +
          encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="#f3efe6" width="400" height="400"/><text x="50%" y="52%" text-anchor="middle" fill="#8a7a62" font-size="18" font-family="sans-serif">Sin imagen</text></svg>`,
          ),
    };
    const badge = form.badge.trim();
    upsertProduct(badge ? { ...base, badge } : base);
    trackAdmin(editing ? `editó ${base.name}` : `creó ${base.name}`);
    toast.success(editing ? "Producto actualizado." : "Producto creado.");
    setForm(emptyForm);
  };

  const onDelete = (product: Product) => {
    if (!window.confirm(`¿Eliminar “${product.name}”?`)) return;
    deleteProduct(product.id);
    trackAdmin(`eliminó ${product.name}`);
    toast.success("Producto eliminado.");
    if (form.id === product.id) setForm(emptyForm);
  };

  const onImage = async (file: File | undefined) => {
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((prev) => ({ ...prev, image: dataUrl }));
      trackAdmin(`subió imagen ${file.name}`);
    } catch {
      toast.error("No se pudo leer la imagen.");
    }
  };

  const onSaveTracking = (event: FormEvent) => {
    event.preventDefault();
    saveSettings({
      ...settings,
      gaId: gaId.trim(),
      metaPixelId: metaPixelId.trim(),
    });
    trackAdmin("guardó Google Analytics / Meta Pixel");
    toast.success("Configuración de tracking guardada.");
  };

  const onSaveCampaign = (event: FormEvent) => {
    event.preventDefault();
    if (!campaign.name.trim()) {
      toast.error("La campaña necesita un nombre.");
      return;
    }
    const next: Campaign = {
      id: newId("ads"),
      name: campaign.name.trim(),
      source: campaign.source.trim(),
      medium: campaign.medium.trim(),
      spend: campaign.spend.trim(),
      notes: campaign.notes.trim(),
    };
    saveSettings({ ...settings, campaigns: [next, ...settings.campaigns] });
    trackAdmin(`guardó campaña ${next.name}`);
    toast.success("Campaña guardada.");
    setCampaign({ name: "", source: "", medium: "", spend: "", notes: "" });
  };

  const removeCampaign = (id: string) => {
    saveSettings({
      ...settings,
      campaigns: settings.campaigns.filter((item) => item.id !== id),
    });
    trackAdmin("eliminó una campaña");
  };

  const tabs = [
    { id: "productos" as const, label: "Productos" },
    { id: "campanas" as const, label: "Campañas y pixels" },
    { id: "stats" as const, label: "Estadísticas" },
  ];

  const stats = [
    { label: "Productos", value: String(products.length) },
    { label: "Búsquedas", value: String(searches.length) },
    { label: "Agregados al carrito", value: String(cartAdds) },
    { label: "Suscripciones", value: String(subscriptions.length) },
    { label: "Eventos admin", value: String(adminEvents.length) },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="border-b border-rule bg-ink text-parchment">
        <div className={`${pageShell} flex flex-wrap items-center justify-between gap-3 py-5`}>
          <div>
            <p className="ui-text text-[10px] uppercase tracking-[0.22em] text-gold-soft">
              SAQ · Dashboard
            </p>
            <h1 className="font-display text-3xl font-normal">Administración</h1>
          </div>
          <Link
            to="/"
            className="ui-text rounded-sm border border-gold-soft px-4 py-2 text-[12px] uppercase tracking-[0.08em] text-gold-soft hover:bg-gold-soft/15"
          >
            Ver tienda
          </Link>
        </div>
      </header>

      <div className={`${pageShell} py-8`}>
        {lastEvent ? (
          <p className="ui-text mb-6 rounded-sm border border-rule bg-card px-4 py-3 text-[13px] text-sepia">
            Último evento registrado:{" "}
            <strong className="text-ink">
              {lastEvent.type} · {lastEvent.label}
            </strong>{" "}
            · {formatWhen(lastEvent.at)}
          </p>
        ) : (
          <p className="ui-text mb-6 text-[13px] text-muted-foreground">
            Todavía no hay eventos registrados.
          </p>
        )}

        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-5">
          {stats.map((item) => (
            <div key={item.label} className="rounded-sm border border-rule bg-card px-4 py-4">
              <p className="ui-text text-[10px] uppercase tracking-[0.16em] text-gold">
                {item.label}
              </p>
              <p className="ui-text mt-1 text-2xl font-semibold tabular-nums text-ink">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="ui-text mb-6 flex flex-wrap gap-2 border-b border-rule pb-3">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-sm px-3 py-1.5 text-[12px] uppercase tracking-[0.08em] ${
                tab === item.id ? "bg-primary text-primary-foreground" : "text-sepia hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "productos" ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <form onSubmit={onSaveProduct} className="rounded-sm border border-rule bg-card p-5">
              <h2 className="mb-4 font-display text-2xl text-ink">
                {editing ? "Editar producto" : "Crear producto"}
              </h2>
              <div className="grid grid-cols-1 gap-3">
                <label className="ui-text text-[12px] text-sepia">
                  Nombre
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="mt-1 h-10 w-full rounded-sm border border-ink/20 bg-background px-3 text-sm text-ink"
                  />
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="ui-text text-[12px] text-sepia">
                    Categoría filtro
                    <select
                      value={form.group}
                      onChange={(e) => setForm((p) => ({ ...p, group: e.target.value }))}
                      className="mt-1 h-10 w-full rounded-sm border border-ink/20 bg-background px-3 text-sm text-ink"
                    >
                      {productGroups.map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="ui-text text-[12px] text-sepia">
                    Precio (ARS)
                    <input
                      value={form.price}
                      onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                      inputMode="numeric"
                      className="mt-1 h-10 w-full rounded-sm border border-ink/20 bg-background px-3 text-sm text-ink"
                    />
                  </label>
                </div>
                <label className="ui-text text-[12px] text-sepia">
                  Categoría visible
                  <input
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    placeholder="Papelería · Cuadernos"
                    className="mt-1 h-10 w-full rounded-sm border border-ink/20 bg-background px-3 text-sm text-ink"
                  />
                </label>
                <label className="ui-text text-[12px] text-sepia">
                  Descripción
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    rows={3}
                    className="mt-1 w-full rounded-sm border border-ink/20 bg-background px-3 py-2 text-sm text-ink"
                  />
                </label>
                <label className="ui-text text-[12px] text-sepia">
                  Badge (opcional)
                  <input
                    value={form.badge}
                    onChange={(e) => setForm((p) => ({ ...p, badge: e.target.value }))}
                    placeholder="Novedad"
                    className="mt-1 h-10 w-full rounded-sm border border-ink/20 bg-background px-3 text-sm text-ink"
                  />
                </label>
                <label className="ui-text text-[12px] text-sepia">
                  Imagen
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => void onImage(e.target.files?.[0])}
                    className="mt-1 block w-full text-sm text-ink file:mr-3 file:rounded-sm file:border file:border-ink/20 file:bg-secondary file:px-3 file:py-1.5"
                  />
                </label>
                {form.image ? (
                  <img src={form.image} alt="" className="h-28 w-28 rounded-sm object-cover" />
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="ui-text rounded-sm bg-primary px-4 py-2.5 text-[12px] uppercase tracking-[0.08em] text-primary-foreground"
                >
                  {editing ? "Guardar cambios" : "Crear producto"}
                </button>
                {editing ? (
                  <button
                    type="button"
                    onClick={() => setForm(emptyForm)}
                    className="ui-text rounded-sm border border-ink/20 px-4 py-2.5 text-[12px] uppercase tracking-[0.08em]"
                  >
                    Cancelar
                  </button>
                ) : null}
              </div>
            </form>

            <div className="overflow-x-auto rounded-sm border border-rule bg-card">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="ui-text border-b border-rule text-[11px] uppercase tracking-[0.08em] text-sepia">
                  <tr>
                    <th className="px-3 py-3">Producto</th>
                    <th className="px-3 py-3">Grupo</th>
                    <th className="px-3 py-3">Precio</th>
                    <th className="px-3 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-rule last:border-0">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt=""
                            className="h-10 w-10 rounded-sm object-cover"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink">{product.name}</p>
                            <p className="truncate text-[12px] text-muted-foreground">
                              {product.category}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">{product.group}</td>
                      <td className="ui-text px-3 py-3 tabular-nums">{formatARS(product.price)}</td>
                      <td className="ui-text px-3 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="text-primary hover:underline"
                            onClick={() => fillForm(product)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="text-destructive hover:underline"
                            onClick={() => onDelete(product)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {tab === "campanas" ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <form onSubmit={onSaveTracking} className="rounded-sm border border-rule bg-card p-5">
              <h2 className="mb-4 font-display text-2xl text-ink">Google Analytics y Meta Pixel</h2>
              <label className="ui-text mb-3 block text-[12px] text-sepia">
                Measurement ID (GA4)
                <input
                  value={gaId}
                  onChange={(e) => setGaId(e.target.value)}
                  placeholder="G-XXXXXXXX"
                  className="mt-1 h-10 w-full rounded-sm border border-ink/20 bg-background px-3 text-sm text-ink"
                />
              </label>
              <label className="ui-text mb-4 block text-[12px] text-sepia">
                Meta Pixel ID
                <input
                  value={metaPixelId}
                  onChange={(e) => setMetaPixelId(e.target.value)}
                  placeholder="1234567890"
                  className="mt-1 h-10 w-full rounded-sm border border-ink/20 bg-background px-3 text-sm text-ink"
                />
              </label>
              <button
                type="submit"
                className="ui-text rounded-sm bg-primary px-4 py-2.5 text-[12px] uppercase tracking-[0.08em] text-primary-foreground"
              >
                Guardar tracking
              </button>
            </form>

            <form onSubmit={onSaveCampaign} className="rounded-sm border border-rule bg-card p-5">
              <h2 className="mb-4 font-display text-2xl text-ink">Datos de campañas / ads</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="ui-text text-[12px] text-sepia">
                  Nombre
                  <input
                    value={campaign.name}
                    onChange={(e) => setCampaign((p) => ({ ...p, name: e.target.value }))}
                    className="mt-1 h-10 w-full rounded-sm border border-ink/20 bg-background px-3 text-sm text-ink"
                  />
                </label>
                <label className="ui-text text-[12px] text-sepia">
                  Source / UTM
                  <input
                    value={campaign.source}
                    onChange={(e) => setCampaign((p) => ({ ...p, source: e.target.value }))}
                    placeholder="meta, google, email"
                    className="mt-1 h-10 w-full rounded-sm border border-ink/20 bg-background px-3 text-sm text-ink"
                  />
                </label>
                <label className="ui-text text-[12px] text-sepia">
                  Medium
                  <input
                    value={campaign.medium}
                    onChange={(e) => setCampaign((p) => ({ ...p, medium: e.target.value }))}
                    placeholder="cpc, social"
                    className="mt-1 h-10 w-full rounded-sm border border-ink/20 bg-background px-3 text-sm text-ink"
                  />
                </label>
                <label className="ui-text text-[12px] text-sepia">
                  Inversión
                  <input
                    value={campaign.spend}
                    onChange={(e) => setCampaign((p) => ({ ...p, spend: e.target.value }))}
                    placeholder="$50.000"
                    className="mt-1 h-10 w-full rounded-sm border border-ink/20 bg-background px-3 text-sm text-ink"
                  />
                </label>
              </div>
              <label className="ui-text mt-3 block text-[12px] text-sepia">
                Notas
                <textarea
                  value={campaign.notes}
                  onChange={(e) => setCampaign((p) => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  className="mt-1 w-full rounded-sm border border-ink/20 bg-background px-3 py-2 text-sm text-ink"
                />
              </label>
              <button
                type="submit"
                className="ui-text mt-4 rounded-sm bg-primary px-4 py-2.5 text-[12px] uppercase tracking-[0.08em] text-primary-foreground"
              >
                Guardar campaña
              </button>
            </form>

            <div className="lg:col-span-2">
              <h3 className="mb-3 font-display text-xl text-ink">Campañas guardadas</h3>
              {settings.campaigns.length === 0 ? (
                <p className="text-sm text-muted-foreground">Todavía no hay campañas.</p>
              ) : (
                <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {settings.campaigns.map((item) => (
                    <li key={item.id} className="rounded-sm border border-rule bg-card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-ink">{item.name}</p>
                          <p className="ui-text text-[12px] text-sepia">
                            {item.source || "—"} / {item.medium || "—"} ·{" "}
                            {item.spend || "sin inversión"}
                          </p>
                          {item.notes ? (
                            <p className="mt-1 text-[13px] text-foreground/75">{item.notes}</p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          className="ui-text text-[12px] text-destructive"
                          onClick={() => removeCampaign(item.id)}
                        >
                          Borrar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}

        {tab === "stats" ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <section className="rounded-sm border border-rule bg-card p-5">
              <h2 className="mb-3 font-display text-2xl text-ink">Búsquedas</h2>
              {searches.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nadie buscó todavía.</p>
              ) : (
                <ol className="ui-text list-decimal space-y-1 pl-5 text-sm">
                  {searches.slice(0, 20).map((item, i) => (
                    <li key={`${item}-${i}`}>{item}</li>
                  ))}
                </ol>
              )}
            </section>
            <section className="rounded-sm border border-rule bg-card p-5">
              <h2 className="mb-3 font-display text-2xl text-ink">Suscripciones</h2>
              {subscriptions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin suscriptores todavía.</p>
              ) : (
                <ul className="ui-text space-y-1 text-sm">
                  {subscriptions.map((email) => (
                    <li key={email}>{email}</li>
                  ))}
                </ul>
              )}
            </section>
            <section className="rounded-sm border border-rule bg-card p-5">
              <h2 className="mb-3 font-display text-2xl text-ink">Eventos del admin</h2>
              {adminEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin acciones de administración.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {adminEvents.slice(0, 15).map((item) => (
                    <li key={item.id}>
                      <span className="text-ink">{item.label}</span>
                      <span className="ui-text ml-2 text-[12px] text-muted-foreground">
                        {formatWhen(item.at)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="rounded-sm border border-rule bg-card p-5">
              <h2 className="mb-3 font-display text-2xl text-ink">Actividad reciente</h2>
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin actividad.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {events.slice(0, 20).map((item) => (
                    <li key={item.id} className="min-w-0 truncate">
                      <span className="ui-text text-[11px] uppercase tracking-[0.08em] text-gold">
                        {item.type}
                      </span>{" "}
                      {item.label}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
