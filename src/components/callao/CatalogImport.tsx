import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import {
  fetchManagedProducts,
  importCatalogRows,
  type ProductRow,
} from "@/lib/catalog";
import {
  downloadCatalogBackup,
  downloadCsv,
  downloadIssues,
  downloadTemplate,
  downloadWorkbook,
  parseImportFile,
  previewImport,
  productRowsToSheet,
  type ImportPreview,
} from "@/lib/catalog-io";
import { catalogCategories, knownBrands } from "@/lib/site";
import { refreshCatalog, useShop } from "@/lib/shop-store";

type ExportFilter = {
  category: string;
  brand: string;
  status: string;
  featured: string;
  missing: string;
};

const emptyFilter: ExportFilter = {
  category: "",
  brand: "",
  status: "",
  featured: "",
  missing: "",
};

function applyExportFilter(rows: ProductRow[], filter: ExportFilter) {
  return rows.filter((row) => {
    if (filter.category && row.category !== filter.category) return false;
    if (filter.brand && (row.brand ?? "") !== filter.brand) return false;
    if (filter.status === "activos" && !row.published) return false;
    if (filter.status === "inactivos" && row.published) return false;
    if (filter.featured === "si" && !row.featured) return false;
    if (filter.featured === "no" && row.featured) return false;
    if (filter.missing === "precio" && row.price > 0) return false;
    if (filter.missing === "imagen" && row.image_url) return false;
    return true;
  });
}

export function CatalogImport({ rows, onReload }: { rows: ProductRow[]; onReload: () => Promise<void> }) {
  const { user } = useAuth();
  const { settings } = useShop();
  const [filter, setFilter] = useState<ExportFilter>(emptyFilter);
  const [raw, setRaw] = useState<Record<string, unknown>[] | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [mode, setMode] = useState<"update" | "skip">("update");
  const [busy, setBusy] = useState(false);

  const rebuildPreview = (nextMode: "update" | "skip", records = raw, existing = rows) => {
    if (!records) return;
    setPreview(previewImport(records, existing, nextMode));
  };

  const filtered = useMemo(() => applyExportFilter(rows, filter), [rows, filter]);

  const exportRows = (format: "xlsx" | "csv", source: ProductRow[]) => {
    const sheet = productRowsToSheet(source);
    if (format === "csv") downloadCsv("productos-callao.csv", sheet);
    else downloadWorkbook("productos-callao.xlsx", sheet);
  };

  return (
    <section className="space-y-5">
      <div className="rounded-md border border-rule bg-card p-5">
        <h2 className="font-display text-2xl text-ink">Exportar</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {filtered.length} de {rows.length} productos según el filtro actual.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
          <select
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            className="h-10 rounded-sm border border-ink/20 bg-background px-2 text-sm"
          >
            <option value="">Categoría</option>
            {catalogCategories.map((cat) => (
              <option key={cat.slug}>{cat.name}</option>
            ))}
          </select>
          <select
            value={filter.brand}
            onChange={(e) => setFilter({ ...filter, brand: e.target.value })}
            className="h-10 rounded-sm border border-ink/20 bg-background px-2 text-sm"
          >
            <option value="">Marca</option>
            {knownBrands.map((brand) => (
              <option key={brand}>{brand}</option>
            ))}
          </select>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="h-10 rounded-sm border border-ink/20 bg-background px-2 text-sm"
          >
            <option value="">Estado</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
          <select
            value={filter.featured}
            onChange={(e) => setFilter({ ...filter, featured: e.target.value })}
            className="h-10 rounded-sm border border-ink/20 bg-background px-2 text-sm"
          >
            <option value="">Destacados</option>
            <option value="si">Solo destacados</option>
            <option value="no">No destacados</option>
          </select>
          <select
            value={filter.missing}
            onChange={(e) => setFilter({ ...filter, missing: e.target.value })}
            className="h-10 rounded-sm border border-ink/20 bg-background px-2 text-sm"
          >
            <option value="">Completitud</option>
            <option value="precio">Sin precio</option>
            <option value="imagen">Sin imagen</option>
          </select>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => exportRows("xlsx", rows)}
            className="ui-text rounded-sm bg-primary px-4 py-2.5 text-[12px] uppercase tracking-[0.08em] text-primary-foreground"
          >
            Exportar todos XLSX
          </button>
          <button
            type="button"
            onClick={() => exportRows("csv", rows)}
            className="ui-text rounded-sm border border-ink/20 px-4 py-2.5 text-[12px] uppercase tracking-[0.08em]"
          >
            Exportar todos CSV
          </button>
          <button
            type="button"
            onClick={() => exportRows("xlsx", filtered)}
            className="ui-text rounded-sm border border-ink/20 px-4 py-2.5 text-[12px] uppercase tracking-[0.08em]"
          >
            Exportar filtrados XLSX
          </button>
          <button
            type="button"
            onClick={() => exportRows("csv", filtered)}
            className="ui-text rounded-sm border border-ink/20 px-4 py-2.5 text-[12px] uppercase tracking-[0.08em]"
          >
            Exportar filtrados CSV
          </button>
          <button
            type="button"
            onClick={() =>
              downloadCatalogBackup(rows, settings as unknown as Record<string, unknown>)
            }
            className="ui-text rounded-sm border border-ink/20 px-4 py-2.5 text-[12px] uppercase tracking-[0.08em]"
          >
            Exportar backup completo
          </button>
        </div>
      </div>

      <div className="rounded-md border border-rule bg-card p-5">
        <h2 className="font-display text-2xl text-ink">Importar productos</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          El SKU identifica cada producto. Revisá la vista previa antes de confirmar. Un archivo con
          errores no se guarda.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => downloadTemplate()}
            className="ui-text rounded-sm border border-ink/20 px-4 py-2.5 text-[12px] uppercase tracking-[0.08em]"
          >
            Descargar plantilla
          </button>
          <label className="ui-text inline-flex min-h-10 cursor-pointer items-center rounded-sm bg-primary px-4 text-[12px] uppercase tracking-[0.08em] text-primary-foreground">
            Importar productos
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                void parseImportFile(file)
                  .then(async (records) => {
                    const existing = rows.length ? rows : await fetchManagedProducts();
                    setRaw(records);
                    setPreview(previewImport(records, existing, mode));
                  })
                  .catch((err: unknown) =>
                    toast.error(err instanceof Error ? err.message : "No se pudo leer el archivo."),
                  );
              }}
            />
          </label>
        </div>

        <div className="mt-4">
          <p className="ui-text mb-2 text-[12px] text-sepia">Si el SKU ya existe</p>
          <label className="mr-4 text-sm">
            <input
              type="radio"
              checked={mode === "update"}
              onChange={() => {
                setMode("update");
                rebuildPreview("update");
              }}
            />{" "}
            Actualizar producto existente
          </label>
          <label className="text-sm">
            <input
              type="radio"
              checked={mode === "skip"}
              onChange={() => {
                setMode("skip");
                rebuildPreview("skip");
              }}
            />{" "}
            Ignorarlo
          </label>
        </div>

        {preview ? (
          <div className="mt-5 rounded-sm border border-rule p-4">
            <p className="font-display text-xl text-ink">{preview.rows.length} productos detectados</p>
            <p className="mt-2 text-sm text-foreground/80">
              {preview.valid.length} válidos · {preview.warnings.length} con advertencias ·{" "}
              {preview.errors.length} con errores
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Nuevos: {preview.created} · Actualizaciones: {preview.updated} · Ignorados:{" "}
              {preview.ignored} · Errores: {preview.errors.length}
            </p>
            {preview.errors.length ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-rule text-sepia">
                      <th className="py-2 pr-3">Fila</th>
                      <th className="py-2 pr-3">Columna</th>
                      <th className="py-2 pr-3">Problema</th>
                      <th className="py-2">Solución esperada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.errors.map((issue, i) => (
                      <tr key={`${issue.row}-${issue.column}-${i}`} className="border-b border-rule/60">
                        <td className="py-2 pr-3">{issue.row}</td>
                        <td className="py-2 pr-3">{issue.column}</td>
                        <td className="py-2 pr-3">{issue.problem}</td>
                        <td className="py-2">{issue.solution}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  type="button"
                  onClick={() => downloadIssues("errores-importacion.xlsx", preview.errors)}
                  className="ui-text mt-3 text-[12px] uppercase tracking-[0.08em] text-primary"
                >
                  Descargar errores-importacion.xlsx
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={busy || !user || !preview.valid.length}
                onClick={() => {
                  if (!user) return;
                  setBusy(true);
                  void importCatalogRows(preview.valid, user.id, mode)
                    .then(() => onReload())
                    .then(() => refreshCatalog())
                    .then(() => {
                      toast.success("Importación confirmada.");
                      setPreview(null);
                    })
                    .catch((err: unknown) =>
                      toast.error(err instanceof Error ? err.message : "No se pudo importar."),
                    )
                    .finally(() => setBusy(false));
                }}
                className="ui-text mt-4 rounded-sm bg-primary px-5 py-2.5 text-[13px] uppercase tracking-[0.08em] text-primary-foreground disabled:opacity-60"
              >
                Confirmar importación
              </button>
            )}
            {preview.warnings.length ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Hay advertencias, pero no bloquean la importación.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
