import * as XLSX from "xlsx";
import type { ProductRow } from "@/lib/catalog";
import { catalogCategories, knownBrands } from "@/lib/site";
import { sanitizeMultiline, sanitizeText } from "@/lib/sanitize";

export const IMPORT_COLUMNS = [
  "SKU",
  "Nombre",
  "Marca",
  "Categoría",
  "Subcategoría",
  "Descripción",
  "Precio",
  "Precio anterior",
  "Estado",
  "Destacado",
  "Novedad",
  "Badge",
  "Imagen",
  "Disponibilidad",
  "Orden",
] as const;

export type ImportRow = {
  sku: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  description: string;
  price: number;
  compare: number;
  published: boolean;
  featured: boolean;
  isNew: boolean;
  badge: string;
  image: string;
  inventory: number;
  sortOrder: number;
  rowNumber: number;
};

export type ImportIssue = {
  row: number;
  column: string;
  problem: string;
  solution: string;
  level: "error" | "warning";
};

export type ImportPreview = {
  rows: ImportRow[];
  valid: ImportRow[];
  warnings: ImportIssue[];
  errors: ImportIssue[];
  created: number;
  updated: number;
  ignored: number;
};

function yes(value: unknown) {
  const text = String(value ?? "")
    .trim()
    .toLowerCase();
  return ["1", "si", "sí", "true", "activo", "publicado", "yes", "x"].includes(text);
}

function num(value: unknown): number | null {
  if (value === "" || value == null) return 0;
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.floor(value));
  const text = String(value).replace(/\./g, "").replace(",", ".").trim();
  if (!text) return 0;
  if (/[a-zA-Z]/.test(text)) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : null;
}

function cell(record: Record<string, unknown>, aliases: string[]) {
  for (const key of Object.keys(record)) {
    if (aliases.some((alias) => alias.toLowerCase() === key.trim().toLowerCase())) {
      return record[key];
    }
  }
  return "";
}

export function productRowsToSheet(rows: ProductRow[]) {
  return rows.map((row) => ({
    SKU: row.sku ?? "",
    Nombre: row.name,
    Marca: row.brand ?? "",
    Categoría: row.category,
    Subcategoría: row.subcategory ?? "",
    Descripción: row.description,
    Precio: row.price,
    "Precio anterior": row.compare_at_price ?? "",
    Estado: row.published ? "activo" : "inactivo",
    Destacado: row.featured ? "si" : "no",
    Novedad: row.is_new ? "si" : "no",
    Badge: row.badge ?? "",
    Imagen: row.image_url,
    Disponibilidad: row.inventory_qty,
    Orden: row.sort_order,
  }));
}

export function downloadWorkbook(filename: string, rows: Record<string, unknown>[]) {
  const sheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{}]);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Productos");
  XLSX.writeFile(book, filename);
}

export function downloadTemplate() {
  downloadWorkbook("plantilla-productos-callao.xlsx", [
    {
      SKU: "SHARPIE-FINE-NEGRO",
      Nombre: "Marcador Sharpie Fine",
      Marca: "Sharpie",
      Categoría: "Escolar",
      Subcategoría: "Marcadores",
      Descripción: "",
      Precio: "",
      "Precio anterior": "",
      Estado: "inactivo",
      Destacado: "no",
      Novedad: "no",
      Badge: "",
      Imagen: "",
      Disponibilidad: 0,
      Orden: 0,
    },
  ]);
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  const sheet = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(sheet);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function parseImportFile(file: File): Promise<Record<string, unknown>[]> {
  const buffer = await file.arrayBuffer();
  const book = XLSX.read(buffer, { type: "array" });
  const first = book.SheetNames[0];
  if (!first) return [];
  const sheet = book.Sheets[first];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
}

export function previewImport(
  raw: Record<string, unknown>[],
  existing: ProductRow[],
  mode: "update" | "skip",
): ImportPreview {
  const bySku = new Map(
    existing
      .filter((row) => row.sku)
      .map((row) => [String(row.sku).trim().toLowerCase(), row]),
  );
  const seen = new Set<string>();
  const rows: ImportRow[] = [];
  const warnings: ImportIssue[] = [];
  const errors: ImportIssue[] = [];
  const categories = new Set(catalogCategories.map((c) => c.name.toLowerCase()));

  raw.forEach((record, index) => {
    const rowNumber = index + 2;
    const sku = sanitizeText(cell(record, ["SKU", "sku"]), 64);
    const name = sanitizeText(cell(record, ["Nombre", "name"]), 160);
    const brand = sanitizeText(cell(record, ["Marca", "brand"]), 80);
    const category = sanitizeText(cell(record, ["Categoría", "Categoria", "category"]), 80);
    const subcategory = sanitizeText(cell(record, ["Subcategoría", "Subcategoria", "subcategory"]), 80);
    const description = sanitizeMultiline(cell(record, ["Descripción", "Descripcion", "description"]), 4000);
    const price = num(cell(record, ["Precio", "price"]));
    const compare = num(cell(record, ["Precio anterior", "compare", "precio_anterior"]));
    const image = sanitizeText(cell(record, ["Imagen", "image", "image_url"]), 500);
    const badge = sanitizeText(cell(record, ["Badge"]), 40);
    const inventory = num(cell(record, ["Disponibilidad", "stock", "inventario"])) ?? 0;
    const sortOrder = num(cell(record, ["Orden", "orden", "sort"])) ?? 0;
    const estado = String(cell(record, ["Estado", "status"]) ?? "");
    const featured = yes(cell(record, ["Destacado", "featured"]));
    const isNew = yes(cell(record, ["Novedad", "nuevo"]));

    if (!name && !sku) {
      errors.push({
        row: rowNumber,
        column: "Nombre",
        problem: "Fila vacía",
        solution: "Completá al menos SKU y nombre.",
        level: "error",
      });
      return;
    }
    if (!sku) {
      errors.push({
        row: rowNumber,
        column: "SKU",
        problem: "SKU vacío",
        solution: "El SKU es el identificador de la importación.",
        level: "error",
      });
    }
    if (!name) {
      errors.push({
        row: rowNumber,
        column: "Nombre",
        problem: "Nombre vacío",
        solution: "Ingresá el nombre del producto.",
        level: "error",
      });
    }
    if (price === null) {
      errors.push({
        row: rowNumber,
        column: "Precio",
        problem: `Valor inválido: “${String(cell(record, ["Precio"]))}”`,
        solution: "Usá un número entero en pesos, o dejalo vacío para consultar.",
        level: "error",
      });
    }
    if (compare === null) {
      errors.push({
        row: rowNumber,
        column: "Precio anterior",
        problem: "Valor inválido",
        solution: "Usá un número o dejá la celda vacía.",
        level: "error",
      });
    }
    if (category && !categories.has(category.toLowerCase())) {
      warnings.push({
        row: rowNumber,
        column: "Categoría",
        problem: `“${category}” no está en el listado principal`,
        solution: `Usá una de: ${catalogCategories.map((c) => c.name).join(", ")}.`,
        level: "warning",
      });
    }
    if (brand && !knownBrands.some((item) => item.toLowerCase() === brand.toLowerCase())) {
      warnings.push({
        row: rowNumber,
        column: "Marca",
        problem: `“${brand}” no está en la lista habitual`,
        solution: "Se va a guardar igual. Confirmá que el nombre sea el correcto.",
        level: "warning",
      });
    }
    const skuKey = sku.toLowerCase();
    if (sku && seen.has(skuKey)) {
      errors.push({
        row: rowNumber,
        column: "SKU",
        problem: "SKU repetido en el archivo",
        solution: "Dejá un solo registro por SKU.",
        level: "error",
      });
    }
    if (sku) seen.add(skuKey);

    rows.push({
      sku,
      name,
      brand,
      category: category || "Escolar",
      subcategory,
      description,
      price: price ?? 0,
      compare: compare ?? 0,
      published: yes(estado) || estado.toLowerCase() === "activo",
      featured,
      isNew,
      badge,
      image,
      inventory,
      sortOrder,
      rowNumber,
    });
  });

  const errorRows = new Set(errors.map((item) => item.row));
  const valid = rows.filter((row) => !errorRows.has(row.rowNumber));
  let created = 0;
  let updated = 0;
  let ignored = 0;
  for (const row of valid) {
    const exists = bySku.has(row.sku.toLowerCase());
    if (!exists) created += 1;
    else if (mode === "update") updated += 1;
    else ignored += 1;
  }

  return { rows, valid, warnings, errors, created, updated, ignored };
}

export function issuesToSheet(issues: ImportIssue[]) {
  return issues.map((issue) => ({
    Fila: issue.row,
    Columna: issue.column,
    Problema: issue.problem,
    "Solución esperada": issue.solution,
    Nivel: issue.level,
  }));
}

export function downloadIssues(filename: string, issues: ImportIssue[]) {
  downloadWorkbook(filename, issuesToSheet(issues));
}

export function downloadCatalogBackup(rows: ProductRow[], settings: Record<string, unknown> = {}) {
  const safeSettings = {
    tagline: settings["tagline"] ?? "",
    heroEyebrow: settings["heroEyebrow"] ?? "",
    heroTitle: settings["heroTitle"] ?? "",
    heroDescription: settings["heroDescription"] ?? "",
    email: settings["email"] ?? "",
    instagramUrl: settings["instagramUrl"] ?? "",
    legalName: settings["legalName"] ?? "",
    cuit: settings["cuit"] ?? "",
  };
  const payload = {
    exportedAt: new Date().toISOString(),
    products: rows,
    categories: catalogCategories,
    brands: knownBrands,
    settings: safeSettings,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `backup-catalogo-callao-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
