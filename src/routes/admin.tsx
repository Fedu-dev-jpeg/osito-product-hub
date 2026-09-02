import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { formatARS, slugify, type Product } from "@/components/callao/data";
import {
  deleteProduct,
  getSettings,
  saveProduct,
  saveSettings,
  useShop,
  type Settings,
} from "@/lib/shop-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin | Librería Callao" },
      { name: "description", content: "Panel de administración de productos y configuración de Librería Callao." },
      { property: "og:title", content: "Admin | Librería Callao" },
      { property: "og:description", content: "Panel de administración de Librería Callao." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const emptyForm = {
  id: "",
  name: "",
  category: "Libros",
  subcategory: "",
  description: "",
  price: "",
  badge: "",
};

function readFileAsDataUrl(file: File | undefined): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) return resolve("");
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function AdminPage() {
  const { products, stats } = useShop();
  const [form, setForm] = useState(emptyForm);
  const [imageData, setImageData] = useState("");
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<Settings>(() => getSettings());

  const editing = Boolean(form.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = form.id || slugify(form.name);
    const existing = products.find((p) => p.id === id);
    const product: Product = {
      id,
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      price: Number(form.price) || 0,
      image: imageData || existing?.image || "",
      ...(form.subcategory.trim() ? { subcategory: form.subcategory.trim() } : {}),
      ...(form.badge.trim() ? { badge: form.badge.trim() } : {}),
    };
    saveProduct(product);
    setForm(emptyForm);
    setImageData("");
    if (fileRef.current) fileRef.current.value = "";
    setMessage(`Producto "${product.name}" guardado.`);
  };

  const handleEdit = (product: Product) => {
    setForm({
      id: product.id,
      name: product.name,
      category: product.category,
      subcategory: product.subcategory ?? "",
      description: product.description,
      price: String(product.price),
      badge: product.badge ?? "",
    });
    setImageData("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const statEntries = Object.entries(stats).filter(
    ([key, value]) => key !== "lastEvent" && typeof value === "number",
  ) as [string, number][];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1180px] px-5 py-8 md:px-8 md:py-10">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-5 border-b border-rule pb-6">
          <div>
            <p className="ui-text mb-2 text-[11px] uppercase tracking-[0.2em] text-gold">
              Panel de administración
            </p>
            <h1 className="font-display text-4xl font-normal text-ink">Librería Callao</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Productos, configuración y debug de clics.
            </p>
          </div>
          <Link
            to="/"
            className="ui-text inline-flex items-center gap-2 rounded-sm border border-primary bg-card px-4 py-2.5 text-[13px] text-primary transition-colors hover:bg-primary/5"
          >
            <ArrowLeft size={15} /> Volver a la tienda
          </Link>
        </div>

        {message && (
          <p className="ui-text mb-4 rounded-sm border border-gold/50 bg-secondary px-4 py-2.5 text-[13px] text-ink">
            {message}
          </p>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Formulario de producto */}
          <section className="rounded-md border border-rule bg-card p-5 md:p-6">
            <h2 className="mb-5 font-display text-2xl font-semibold text-ink">
              {editing ? "Editar producto" : "Nuevo producto"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="ui-text flex flex-col gap-1.5 text-[13px] text-foreground">
                Nombre *
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-10 rounded-sm border border-ink/25 bg-background px-3 text-sm text-ink outline-none focus:border-gold"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="ui-text flex flex-col gap-1.5 text-[13px] text-foreground">
                  Categoría *
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="h-10 rounded-sm border border-ink/25 bg-background px-2 text-sm text-ink outline-none focus:border-gold"
                  >
                    {["Libros", "Papelería", "Escritura", "Escolar", "Agendas"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label className="ui-text flex flex-col gap-1.5 text-[13px] text-foreground">
                  Subcategoría
                  <input
                    value={form.subcategory}
                    onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                    className="h-10 rounded-sm border border-ink/25 bg-background px-3 text-sm text-ink outline-none focus:border-gold"
                  />
                </label>
              </div>
              <label className="ui-text flex flex-col gap-1.5 text-[13px] text-foreground">
                Descripción
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="resize-vertical rounded-sm border border-ink/25 bg-background px-3 py-2 text-sm text-ink outline-none focus:border-gold"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="ui-text flex flex-col gap-1.5 text-[13px] text-foreground">
                  Precio (ARS) *
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="h-10 rounded-sm border border-ink/25 bg-background px-3 text-sm text-ink outline-none focus:border-gold"
                  />
                </label>
                <label className="ui-text flex flex-col gap-1.5 text-[13px] text-foreground">
                  Etiqueta (badge)
                  <input
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="Novedad, Oferta…"
                    className="h-10 rounded-sm border border-ink/25 bg-background px-3 text-sm text-ink outline-none focus:border-gold"
                  />
                </label>
              </div>
              <label className="ui-text flex flex-col gap-1.5 text-[13px] text-foreground">
                Imagen {editing && "(dejá vacío para conservar la actual)"}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={async (e) => setImageData(await readFileAsDataUrl(e.target.files?.[0]))}
                  className="text-sm text-ink file:mr-3 file:rounded-sm file:border file:border-ink/25 file:bg-background file:px-3 file:py-1.5 file:text-[12px] file:text-ink"
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="ui-text rounded-sm bg-primary px-5 py-2.5 text-[13px] uppercase tracking-[0.08em] text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {editing ? "Guardar cambios" : "Crear producto"}
                </button>
                {editing && (
                  <button
                    type="button"
                    onClick={() => {
                      setForm(emptyForm);
                      setImageData("");
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="ui-text rounded-sm border border-ink/25 px-5 py-2.5 text-[13px] uppercase tracking-[0.08em] text-ink hover:border-primary"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* Debug de clics */}
          <section className="rounded-md border border-rule bg-card p-5 md:p-6">
            <h2 className="mb-5 font-display text-2xl font-semibold text-ink">
              Debug de clics (ACM)
            </h2>
            {statEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Todavía no hay eventos registrados. Navegá la tienda y volvé.
              </p>
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
            {stats.lastEvent && (
              <p className="ui-text mt-4 border-t border-rule pt-3 text-[12px] text-muted-foreground">
                Último evento: <strong className="text-ink">{stats.lastEvent.eventName}</strong> ·{" "}
                {new Date(stats.lastEvent.at).toLocaleString("es-AR")}
              </p>
            )}
          </section>
        </div>

        {/* Lista de productos */}
        <section className="mt-5 rounded-md border border-rule bg-card p-5 md:p-6">
          <h2 className="mb-4 font-display text-2xl font-semibold text-ink">
            Productos ({products.length})
          </h2>
          <ul className="divide-y divide-rule">
            {products.map((product) => (
              <li
                key={product.id}
                className="flex items-center gap-3 py-3 sm:grid sm:grid-cols-[58px_1fr_auto]"
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-12 w-12 shrink-0 rounded-sm object-cover sm:h-[58px] sm:w-[58px]"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-secondary font-display text-lg italic text-sepia sm:h-[58px] sm:w-[58px]">
                    {product.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg font-semibold text-ink">
                    {product.name}
                  </p>
                  <p className="ui-text text-[12px] text-muted-foreground">
                    {product.category}
                    {product.subcategory ? ` · ${product.subcategory}` : ""} ·{" "}
                    {formatARS(product.price)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    aria-label={`Editar ${product.name}`}
                    onClick={() => handleEdit(product)}
                    className="rounded-sm border border-ink/25 p-2 text-ink transition-colors hover:border-gold hover:text-gold"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Eliminar ${product.name}`}
                    onClick={() => {
                      if (window.confirm(`¿Eliminar "${product.name}"?`)) deleteProduct(product.id);
                    }}
                    className="rounded-sm border border-ink/25 p-2 text-ink transition-colors hover:border-primary hover:text-primary"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Configuración */}
        <section className="mt-5 rounded-md border border-rule bg-card p-5 md:p-6">
          <h2 className="mb-5 font-display text-2xl font-semibold text-ink">Configuración</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveSettings({ ...settings, freeShippingFrom: Number(settings.freeShippingFrom) || 0 });
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
              <label key={key} className="ui-text flex flex-col gap-1.5 text-[13px] text-foreground">
                {label}
                <input
                  value={settings[key]}
                  onChange={(e) =>
                    setSettings({ ...settings, [key]: key === "freeShippingFrom" ? Number(e.target.value) : e.target.value })
                  }
                  className="h-10 rounded-sm border border-ink/25 bg-background px-3 text-sm text-ink outline-none focus:border-gold"
                />
              </label>
            ))}
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="ui-text rounded-sm bg-primary px-5 py-2.5 text-[13px] uppercase tracking-[0.08em] text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Guardar configuración
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
