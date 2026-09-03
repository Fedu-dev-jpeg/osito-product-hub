import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatARS } from "@/components/callao/data";
import {
  bulkDeleteProducts,
  bulkUpdateProducts,
  deleteCatalogProduct,
  fetchManagedProducts,
  saveCatalogProduct,
  setProductPublished,
  uploadProductImage,
  type ProductRow,
} from "@/lib/catalog";
import { downloadWorkbook, productRowsToSheet } from "@/lib/catalog-io";
import { catalogCategories, knownBrands } from "@/lib/site";
import { matchesQuery } from "@/lib/search";
import { refreshCatalog } from "@/lib/shop-store";
import { useAuth } from "@/lib/auth";

const categories = catalogCategories.map((c) => c.name);

const emptyForm = {
  id: "",
  name: "",
  category: "Escolar",
  subcategory: "",
  brand: "",
  description: "",
  price: "",
  compare: "",
  sku: "",
  inventory: "0",
  badge: "",
  sort: "0",
  featured: false,
  isNew: false,
  isOffer: false,
};

export function ProductManager({ canPublish }: { canPublish: boolean }) {
  const { user, profile } = useAuth();
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [imageUrl, setImageUrl] = useState("");
  const [publishNow, setPublishNow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [listQuery, setListQuery] = useState("");
  const [listCategory, setListCategory] = useState("");
  const [listBrand, setListBrand] = useState("");
  const [listStatus, setListStatus] = useState("");
  const [listSort, setListSort] = useState("updated");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkBrand, setBulkBrand] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const editing = Boolean(form.id);
  const pageSize = 50;

  const load = async () => {
    if (!user) return;
    const data = await fetchManagedProducts(canPublish ? undefined : user.id);
    setRows(data);
  };

  useEffect(() => {
    void load().catch((err: unknown) => {
      toast.error(err instanceof Error ? err.message : "No se pudieron cargar los productos.");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, canPublish]);

  const onUpload = async (file: File | undefined) => {
    if (!file || !user) return;
    setBusy(true);
    try {
      const url = await uploadProductImage(file, user.id);
      setImageUrl(url);
      toast.success("Imagen subida.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo subir la imagen.");
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      const existing = rows.find((row) => row.id === form.id);
      await saveCatalogProduct(
        {
          ...(form.id ? { id: form.id } : {}),
          name: form.name,
          description: form.description,
          category: form.category,
          subcategory: form.subcategory,
          brand: form.brand,
          price: Number(form.price) || 0,
          image_url: imageUrl || existing?.image_url || "",
          badge: form.badge,
          sku: form.sku,
          compare_at_price: Number(form.compare) || 0,
          inventory_qty: Number(form.inventory) || 0,
          sort_order: Number(form.sort) || 0,
          featured: form.featured,
          is_new: form.isNew,
          is_offer: form.isOffer,
          published: canPublish ? (editing ? Boolean(existing?.published) : publishNow) : false,
        },
        existing?.owner_id ?? user.id,
      );
      setForm(emptyForm);
      setImageUrl("");
      setPublishNow(false);
      if (fileRef.current) fileRef.current.value = "";
      await load();
      await refreshCatalog();
      toast.success(editing ? "Producto actualizado." : "Producto guardado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <form
        onSubmit={(e) => void onSubmit(e)}
        className="rounded-md border border-rule bg-card p-5 md:p-6"
      >
        <h2 className="mb-5 font-display text-2xl font-semibold text-ink">
          {editing ? "Editar producto" : "Nuevo producto"}
        </h2>
        {!canPublish ? (
          <p className="mb-4 text-sm text-muted-foreground">
            Los productos de vendedor quedan pendientes hasta que un admin los publique en /admin.
          </p>
        ) : null}
        <div className="flex flex-col gap-4">
          <label className="ui-text flex flex-col gap-1.5 text-[13px]">
            Nombre *
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-10 rounded-sm border border-ink/25 bg-background px-3 text-sm text-ink outline-none focus:border-gold"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="ui-text flex flex-col gap-1.5 text-[13px]">
              Categoría
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="h-10 rounded-sm border border-ink/25 bg-background px-2 text-sm text-ink outline-none focus:border-gold"
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="ui-text flex flex-col gap-1.5 text-[13px]">
              Subcategoría
              <input
                value={form.subcategory}
                onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                list="callao-subs"
                className="h-10 rounded-sm border border-ink/25 bg-background px-3 text-sm text-ink outline-none focus:border-gold"
              />
            </label>
          </div>
          <datalist id="callao-subs">
            {(catalogCategories.find((c) => c.name === form.category)?.subs ?? []).map((sub) => (
              <option key={sub} value={sub} />
            ))}
          </datalist>
          <label className="ui-text flex flex-col gap-1.5 text-[13px]">
            Marca
            <input
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              list="callao-brands"
              className="h-10 rounded-sm border border-ink/25 bg-background px-3 text-sm text-ink outline-none focus:border-gold"
            />
            <datalist id="callao-brands">
              {knownBrands.map((brand) => (
                <option key={brand} value={brand} />
              ))}
            </datalist>
          </label>
          <label className="ui-text flex flex-col gap-1.5 text-[13px]">
            Descripción
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="rounded-sm border border-ink/25 bg-background px-3 py-2 text-sm text-ink outline-none focus:border-gold"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="ui-text flex flex-col gap-1.5 text-[13px]">
              Precio (ARS)
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="h-10 rounded-sm border border-ink/25 bg-background px-3 text-sm text-ink outline-none focus:border-gold"
              />
            </label>
            <label className="ui-text flex flex-col gap-1.5 text-[13px]">
              Precio anterior
              <input
                type="number"
                min="0"
                value={form.compare}
                onChange={(e) => setForm({ ...form, compare: e.target.value })}
                className="h-10 rounded-sm border border-ink/25 bg-background px-3 text-sm text-ink outline-none focus:border-gold"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="ui-text flex flex-col gap-1.5 text-[13px]">
              SKU
              <input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="h-10 rounded-sm border border-ink/25 bg-background px-3 text-sm text-ink outline-none focus:border-gold"
              />
            </label>
            <label className="ui-text flex flex-col gap-1.5 text-[13px]">
              Inventario
              <input
                type="number"
                min="0"
                value={form.inventory}
                onChange={(e) => setForm({ ...form, inventory: e.target.value })}
                className="h-10 rounded-sm border border-ink/25 bg-background px-3 text-sm text-ink outline-none focus:border-gold"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="ui-text flex flex-col gap-1.5 text-[13px]">
              Badge
              <input
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                className="h-10 rounded-sm border border-ink/25 bg-background px-3 text-sm text-ink outline-none focus:border-gold"
              />
            </label>
            <label className="ui-text flex flex-col gap-1.5 text-[13px]">
              Orden
              <input
                type="number"
                value={form.sort}
                onChange={(e) => setForm({ ...form, sort: e.target.value })}
                className="h-10 rounded-sm border border-ink/25 bg-background px-3 text-sm text-ink outline-none focus:border-gold"
              />
            </label>
          </div>
          <div className="rounded-sm border border-gold/40 bg-secondary/60 p-3">
            <label className="ui-text flex items-center gap-2 text-[13px] text-ink">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              Producto destacado
            </label>
            <p className="mt-1 text-xs text-muted-foreground">
              Solo los destacados aparecen en el carrusel de la home. Usá Orden para definir la
              secuencia.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="ui-text flex items-center gap-2 text-[13px]">
              <input
                type="checkbox"
                checked={form.isNew}
                onChange={(e) => setForm({ ...form, isNew: e.target.checked })}
              />
              Novedad
            </label>
            <label className="ui-text flex items-center gap-2 text-[13px]">
              <input
                type="checkbox"
                checked={form.isOffer}
                onChange={(e) => setForm({ ...form, isOffer: e.target.checked })}
              />
              Oferta
            </label>
          </div>
          <label className="ui-text flex flex-col gap-1.5 text-[13px]">
            Imagen
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => void onUpload(e.target.files?.[0])}
              className="text-sm file:mr-3 file:rounded-sm file:border file:border-ink/25 file:bg-background file:px-3 file:py-1.5"
            />
          </label>
          {imageUrl ? (
            <img src={imageUrl} alt="" className="h-24 w-24 rounded-sm object-cover" />
          ) : null}
          {canPublish && !editing ? (
            <label className="ui-text flex items-center gap-2 text-[13px] text-ink">
              <input
                type="checkbox"
                checked={publishNow}
                onChange={(e) => setPublishNow(e.target.checked)}
              />
              Publicar en la tienda ahora
            </label>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={busy}
              className="ui-text rounded-sm bg-primary px-5 py-2.5 text-[13px] uppercase tracking-[0.08em] text-primary-foreground disabled:opacity-60"
            >
              {editing ? "Guardar cambios" : "Crear producto"}
            </button>
            {editing ? (
              <button
                type="button"
                onClick={() => {
                  setForm(emptyForm);
                  setImageUrl("");
                  setPublishNow(false);
                }}
                className="ui-text rounded-sm border border-ink/25 px-5 py-2.5 text-[13px] uppercase tracking-[0.08em]"
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </div>
      </form>

      <section className="rounded-md border border-rule bg-card p-5 md:p-6">
        <ProductListToolbar
          rows={rows}
          listQuery={listQuery}
          setListQuery={(value) => {
            setListQuery(value);
            setPage(1);
          }}
          listCategory={listCategory}
          setListCategory={(value) => {
            setListCategory(value);
            setPage(1);
          }}
          listBrand={listBrand}
          setListBrand={(value) => {
            setListBrand(value);
            setPage(1);
          }}
          listStatus={listStatus}
          setListStatus={(value) => {
            setListStatus(value);
            setPage(1);
          }}
          listSort={listSort}
          setListSort={setListSort}
        />
        <BulkBar
          selected={selected}
          rows={rows}
          canPublish={canPublish}
          bulkCategory={bulkCategory}
          setBulkCategory={setBulkCategory}
          bulkBrand={bulkBrand}
          setBulkBrand={setBulkBrand}
          onDone={async () => {
            setSelected([]);
            await load();
            await refreshCatalog();
          }}
        />
        <ProductPagedList
          rows={rows}
          listQuery={listQuery}
          listCategory={listCategory}
          listBrand={listBrand}
          listStatus={listStatus}
          listSort={listSort}
          page={page}
          pageSize={pageSize}
          setPage={setPage}
          selected={selected}
          setSelected={setSelected}
          canPublish={canPublish}
          profileRole={profile?.role}
          onEdit={(row) => {
            setForm({
              id: row.id,
              name: row.name,
              category: row.category,
              subcategory: row.subcategory ?? "",
              brand: row.brand ?? "",
              description: row.description,
              price: String(row.price),
              compare: row.compare_at_price ? String(row.compare_at_price) : "",
              sku: row.sku ?? "",
              inventory: String(row.inventory_qty ?? 0),
              badge: row.badge ?? "",
              sort: String(row.sort_order ?? 0),
              featured: Boolean(row.featured),
              isNew: Boolean(row.is_new),
              isOffer: Boolean(row.is_offer),
            });
            setImageUrl(row.image_url);
            setPublishNow(row.published);
          }}
          onReload={async () => {
            await load();
            await refreshCatalog();
          }}
        />
      </section>
    </div>
  );
}

function ProductListToolbar({
  rows,
  listQuery,
  setListQuery,
  listCategory,
  setListCategory,
  listBrand,
  setListBrand,
  listStatus,
  setListStatus,
  listSort,
  setListSort,
}: {
  rows: ProductRow[];
  listQuery: string;
  setListQuery: (value: string) => void;
  listCategory: string;
  setListCategory: (value: string) => void;
  listBrand: string;
  setListBrand: (value: string) => void;
  listStatus: string;
  setListStatus: (value: string) => void;
  listSort: string;
  setListSort: (value: string) => void;
}) {
  const brands = Array.from(new Set(rows.map((row) => row.brand).filter(Boolean))) as string[];
  return (
    <div className="mb-4">
      <h2 className="mb-4 font-display text-2xl font-semibold text-ink">Productos {rows.length}</h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <input
          value={listQuery}
          onChange={(e) => setListQuery(e.target.value)}
          placeholder="Buscar producto…"
          className="h-10 rounded-sm border border-ink/20 bg-background px-3 text-sm"
        />
        <select
          value={listCategory}
          onChange={(e) => setListCategory(e.target.value)}
          className="h-10 rounded-sm border border-ink/20 bg-background px-2 text-sm"
        >
          <option value="">Categoría</option>
          {catalogCategories.map((cat) => (
            <option key={cat.slug}>{cat.name}</option>
          ))}
        </select>
        <select
          value={listBrand}
          onChange={(e) => setListBrand(e.target.value)}
          className="h-10 rounded-sm border border-ink/20 bg-background px-2 text-sm"
        >
          <option value="">Marca</option>
          {brands.map((brand) => (
            <option key={brand}>{brand}</option>
          ))}
        </select>
        <select
          value={listStatus}
          onChange={(e) => setListStatus(e.target.value)}
          className="h-10 rounded-sm border border-ink/20 bg-background px-2 text-sm"
        >
          <option value="">Estado</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
          <option value="destacado">Destacados</option>
        </select>
        <select
          value={listSort}
          onChange={(e) => setListSort(e.target.value)}
          className="h-10 rounded-sm border border-ink/20 bg-background px-2 text-sm"
        >
          <option value="updated">Más recientes</option>
          <option value="name">Nombre</option>
          <option value="order">Orden</option>
        </select>
      </div>
    </div>
  );
}

function BulkBar({
  selected,
  rows,
  canPublish,
  bulkCategory,
  setBulkCategory,
  bulkBrand,
  setBulkBrand,
  onDone,
}: {
  selected: string[];
  rows: ProductRow[];
  canPublish: boolean;
  bulkCategory: string;
  setBulkCategory: (value: string) => void;
  bulkBrand: string;
  setBulkBrand: (value: string) => void;
  onDone: () => Promise<void>;
}) {
  if (!selected.length) return null;
  const run = async (action: () => Promise<void>, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    try {
      await action();
      await onDone();
      toast.success("Acción aplicada.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo completar.");
    }
  };
  return (
    <div className="mb-4 rounded-sm border border-rule bg-secondary/50 p-3 text-sm">
      <p className="mb-2">{selected.length} seleccionados</p>
      <div className="flex flex-wrap gap-2">
        {canPublish ? (
          <>
            <button
              type="button"
              className="rounded-sm border border-ink/20 px-3 py-1.5"
              onClick={() => void run(() => bulkUpdateProducts(selected, { published: true }))}
            >
              Activar
            </button>
            <button
              type="button"
              className="rounded-sm border border-ink/20 px-3 py-1.5"
              onClick={() => void run(() => bulkUpdateProducts(selected, { published: false }))}
            >
              Desactivar
            </button>
          </>
        ) : null}
        <button
          type="button"
          className="rounded-sm border border-ink/20 px-3 py-1.5"
          onClick={() => void run(() => bulkUpdateProducts(selected, { featured: true }))}
        >
          Marcar destacados
        </button>
        <button
          type="button"
          className="rounded-sm border border-ink/20 px-3 py-1.5"
          onClick={() => void run(() => bulkUpdateProducts(selected, { featured: false }))}
        >
          Quitar destacados
        </button>
        <select
          value={bulkCategory}
          onChange={(e) => setBulkCategory(e.target.value)}
          className="h-9 rounded-sm border border-ink/20 px-2"
        >
          <option value="">Cambiar categoría</option>
          {catalogCategories.map((cat) => (
            <option key={cat.slug}>{cat.name}</option>
          ))}
        </select>
        <button
          type="button"
          className="rounded-sm border border-ink/20 px-3 py-1.5"
          disabled={!bulkCategory}
          onClick={() =>
            void run(() => bulkUpdateProducts(selected, { category: bulkCategory }))
          }
        >
          Aplicar categoría
        </button>
        <select
          value={bulkBrand}
          onChange={(e) => setBulkBrand(e.target.value)}
          className="h-9 rounded-sm border border-ink/20 px-2"
        >
          <option value="">Cambiar marca</option>
          {knownBrands.map((brand) => (
            <option key={brand}>{brand}</option>
          ))}
        </select>
        <button
          type="button"
          className="rounded-sm border border-ink/20 px-3 py-1.5"
          disabled={!bulkBrand}
          onClick={() => void run(() => bulkUpdateProducts(selected, { brand: bulkBrand }))}
        >
          Aplicar marca
        </button>
        <button
          type="button"
          className="rounded-sm border border-ink/20 px-3 py-1.5"
          onClick={() => {
            const chosen = rows.filter((row) => selected.includes(row.id));
            downloadWorkbook("productos-seleccion.xlsx", productRowsToSheet(chosen));
          }}
        >
          Exportar selección
        </button>
        <button
          type="button"
          className="rounded-sm border border-ink/20 px-3 py-1.5 text-primary"
          onClick={() =>
            void run(
              () => bulkDeleteProducts(selected),
              `¿Eliminar ${selected.length} productos? Esta acción no se puede deshacer.`,
            )
          }
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

function ProductPagedList({
  rows,
  listQuery,
  listCategory,
  listBrand,
  listStatus,
  listSort,
  page,
  pageSize,
  setPage,
  selected,
  setSelected,
  canPublish,
  profileRole,
  onEdit,
  onReload,
}: {
  rows: ProductRow[];
  listQuery: string;
  listCategory: string;
  listBrand: string;
  listStatus: string;
  listSort: string;
  page: number;
  pageSize: number;
  setPage: (value: number) => void;
  selected: string[];
  setSelected: (value: string[]) => void;
  canPublish: boolean;
  profileRole?: string | undefined;
  onEdit: (row: ProductRow) => void;
  onReload: () => Promise<void>;
}) {
  const filtered = useMemo(() => {
    const list = rows.filter((row) => {
      const hay = `${row.name} ${row.sku ?? ""} ${row.brand ?? ""} ${row.category}`;
      if (listQuery && !matchesQuery(hay, listQuery)) return false;
      if (listCategory && row.category !== listCategory) return false;
      if (listBrand && row.brand !== listBrand) return false;
      if (listStatus === "activo" && !row.published) return false;
      if (listStatus === "inactivo" && row.published) return false;
      if (listStatus === "destacado" && !row.featured) return false;
      return true;
    });
    const ordered = [...list];
    if (listSort === "name") ordered.sort((a, b) => a.name.localeCompare(b.name, "es"));
    else if (listSort === "order") ordered.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    else ordered.sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at));
    return ordered;
  }, [rows, listQuery, listCategory, listBrand, listStatus, listSort]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * pageSize, current * pageSize);
  const allVisibleSelected = visible.length > 0 && visible.every((row) => selected.includes(row.id));

  return (
    <>
      <p className="mb-2 text-xs text-muted-foreground">
        {filtered.length} resultados · página {current} de {pages}
        {profileRole === "admin" && canPublish ? " · catálogo" : ""}
      </p>
      <label className="mb-2 flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={allVisibleSelected}
          onChange={(e) => {
            if (e.target.checked) {
              setSelected(Array.from(new Set([...selected, ...visible.map((row) => row.id)])));
            } else {
              const drop = new Set(visible.map((row) => row.id));
              setSelected(selected.filter((id) => !drop.has(id)));
            }
          }}
        />
        Seleccionar página
      </label>
      <ul className="divide-y divide-rule">
        {visible.map((row) => (
          <li key={row.id} className="flex items-center gap-3 py-3">
            <input
              type="checkbox"
              checked={selected.includes(row.id)}
              onChange={(e) => {
                setSelected(
                  e.target.checked ? [...selected, row.id] : selected.filter((id) => id !== row.id),
                );
              }}
              aria-label={`Seleccionar ${row.name}`}
            />
            {row.image_url ? (
              <img src={row.image_url} alt="" className="h-12 w-12 rounded-sm object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-secondary font-display text-lg italic text-sepia">
                {row.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg font-semibold text-ink">{row.name}</p>
              <p className="ui-text text-[12px] text-muted-foreground">
                {row.category}
                {row.subcategory ? ` · ${row.subcategory}` : ""} · {formatARS(row.price)} ·{" "}
                {row.sku ? `${row.sku} · ` : ""}
                stock {row.inventory_qty ?? 0} · {row.published ? "activo" : "borrador"}
                {row.featured ? " · destacado" : ""}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {canPublish ? (
                <button
                  type="button"
                  className="ui-text rounded-sm border border-ink/25 px-2 py-1 text-[11px] uppercase tracking-[0.08em]"
                  onClick={() => {
                    void setProductPublished(row.id, !row.published)
                      .then(() => onReload())
                      .then(() =>
                        toast.success(
                          row.published ? "Ocultado de la tienda." : "Publicado en la tienda.",
                        ),
                      )
                      .catch((err: unknown) =>
                        toast.error(err instanceof Error ? err.message : "No se pudo publicar."),
                      );
                  }}
                >
                  {row.published ? "Ocultar" : "Publicar"}
                </button>
              ) : null}
              <button
                type="button"
                aria-label={`Editar ${row.name}`}
                className="rounded-sm border border-ink/25 p-2"
                onClick={() => onEdit(row)}
              >
                <Pencil size={15} />
              </button>
              <button
                type="button"
                aria-label={`Eliminar ${row.name}`}
                className="rounded-sm border border-ink/25 p-2 text-primary"
                onClick={() => {
                  if (!window.confirm(`¿Eliminar “${row.name}”?`)) return;
                  void deleteCatalogProduct(row.id)
                    .then(() => onReload())
                    .then(() => toast.success("Producto eliminado."))
                    .catch((err: unknown) =>
                      toast.error(err instanceof Error ? err.message : "No se pudo borrar."),
                    );
                }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </li>
        ))}
      </ul>
      {pages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            disabled={current <= 1}
            onClick={() => setPage(current - 1)}
            className="rounded-sm border border-ink/20 px-3 py-1.5 disabled:opacity-40"
          >
            Anterior
          </button>
          <span>
            {current} / {pages}
          </span>
          <button
            type="button"
            disabled={current >= pages}
            onClick={() => setPage(current + 1)}
            className="rounded-sm border border-ink/20 px-3 py-1.5 disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      ) : null}
    </>
  );
}
