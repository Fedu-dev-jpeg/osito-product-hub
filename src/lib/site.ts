export type Branch = {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  city: string;
  phoneDisplay: string;
  phoneE164: string;
  secondaryPhoneDisplay?: string;
  secondaryPhoneE164?: string;
  weekdayHours: string;
  saturdayHours: string;
  sundayHours: string;
  mapsQuery: string;
  geo: { lat: number; lng: number };
  openingHours: string[];
  whatsappEnabled: boolean;
};

export type CatalogCategory = {
  name: string;
  slug: string;
  description: string;
  subs: string[];
};

export type SiteService = {
  title: string;
  text: string;
};

export const SITE_NAME = "Librería Callao";
export const SITE_LEGAL_NAME = "Librería Callao S.R.L.";
export const SITE_CUIT = "30-70951812-3";
export const SITE_TAGLINE = "Escolar · Comercial · Artística · Papelería";
export const SITE_TITLE = "Librería Callao | Librería escolar, comercial y artística en Recoleta";
export const SITE_DESCRIPTION =
  "Librería Callao en Recoleta, Buenos Aires. Librería escolar, comercial y artística, papelería, artículos de oficina, escritura, impresión y más. Encontranos en nuestras tres sucursales.";

export const DEFAULT_EMAIL = "libreriacallao@hotmail.com";
export const DEFAULT_WHATSAPP = "5491168499976";
export const INSTAGRAM_HANDLE = "@libreriacallao";
export const INSTAGRAM_URL = "https://www.instagram.com/libreriacallao/";
export const GOOGLE_REVIEWS_URL =
  "https://www.google.com/maps/search/?api=1&query=Librer%C3%ADa%20Callao%20Recoleta";

export const catalogCategories: CatalogCategory[] = [
  {
    name: "Escolar",
    slug: "escolar",
    description: "Útiles para el colegio y el comienzo de clases.",
    subs: ["Cartucheras", "Lápices", "Fibras", "Marcadores", "Gomas", "Sacapuntas", "Carpetas", "Cuadernos"],
  },
  {
    name: "Artística",
    slug: "artistica",
    description: "Materiales para dibujo, pintura y proyectos creativos.",
    subs: ["Lápices artísticos", "Pinturas", "Pinceles", "Papeles", "Marcadores", "Materiales creativos"],
  },
  {
    name: "Oficina",
    slug: "oficina",
    description: "Papelería y organización para el trabajo.",
    subs: ["Carpetas", "Biblioratos", "Folios", "Organizadores", "Calculadoras", "Elementos de escritorio"],
  },
  {
    name: "Papelería",
    slug: "papeleria",
    description: "Papeles, resmas y artículos de librería.",
    subs: [],
  },
  {
    name: "Escritura",
    slug: "escritura",
    description: "Bolígrafos, roller, resaltadores y más.",
    subs: ["Bolígrafos", "Roller", "Estilográficas", "Resaltadores", "Repuestos"],
  },
  {
    name: "Cuadernos y agendas",
    slug: "cuadernos-y-agendas",
    description: "Cuadernos, agendas y planificadores.",
    subs: ["Cuadernos", "Agendas"],
  },
  {
    name: "Impresión y computación",
    slug: "impresion-y-computacion",
    description: "Tintas, cartuchos y accesorios.",
    subs: ["Tintas", "Cartuchos", "HP", "Epson", "Accesorios"],
  },
  {
    name: "Embalaje",
    slug: "embalaje",
    description: "Artículos para embalar y enviar.",
    subs: [],
  },
  {
    name: "Libros y textos",
    slug: "libros-y-textos",
    description: "Textos y libros de estudio.",
    subs: [],
  },
  {
    name: "Regalos y varios",
    slug: "regalos-y-varios",
    description: "Detalles y artículos varios.",
    subs: [],
  },
];

export const navLinks = [
  { label: "Productos", href: "/productos", category: "Todos" },
  { label: "Escolar", href: "/productos", category: "Escolar" },
  { label: "Artística", href: "/productos", category: "Artística" },
  { label: "Oficina", href: "/productos", category: "Oficina" },
  { label: "Papelería", href: "/productos", category: "Papelería" },
  { label: "Escritura", href: "/productos", category: "Escritura" },
  { label: "Sucursales", href: "/#sucursales", category: "" },
  { label: "Lista escolar", href: "/lista-escolar", category: "" },
];

export const knownBrands = [
  "Sharpie",
  "Stabilo",
  "Giotto",
  "Pizzini",
  "GTC",
  "Morgan",
  "Nivel 10",
  "Clingsor",
  "HP",
  "Epson",
  "Trodat",
  "Waterman",
  "Parker",
  "Cross",
  "Lamy",
  "Casio",
];

export const searchHints = [
  "Sharpie",
  "Stabilo",
  "Parker",
  "Agenda",
  "Cartuchera",
  "Calculadora",
  "Giotto",
  "Resaltador",
  "Cuaderno",
  "HP",
];

export const siteServices: SiteService[] = [
  { title: "Librería escolar", text: "Todo lo necesario para estudiar y empezar las clases." },
  { title: "Librería artística", text: "Materiales para dibujo, pintura y proyectos creativos." },
  { title: "Librería comercial", text: "Papelería y soluciones para oficinas, profesionales y comercios." },
  { title: "Fotocopias e impresiones", text: "Consultar disponibilidad en sucursal." },
  { title: "Sellos", text: "Productos y soluciones Trodat y similares." },
  { title: "Insumos de impresión", text: "Productos HP, Epson y otros." },
  { title: "Artículos de embalaje", text: "Materiales para embalar y proteger." },
  { title: "Textos y libros de estudio", text: "Textos escolares y material de estudio." },
];

export const branches: Branch[] = [
  {
    id: "callao-1588",
    name: "Av. Callao 1588",
    address: "Av. Callao 1588",
    neighborhood: "Recoleta",
    city: "CABA",
    phoneDisplay: "11 6849-9976",
    phoneE164: "+541168499976",
    weekdayHours: "Lunes a viernes: 9:00 a 20:00",
    saturdayHours: "Sábados: 9:30 a 13:00",
    sundayHours: "Domingos: cerrado",
    mapsQuery: "Av. Callao 1588, Recoleta, CABA",
    geo: { lat: -34.5896, lng: -58.3926 },
    openingHours: ["Mo-Fr 09:00-20:00", "Sa 09:30-13:00"],
    whatsappEnabled: true,
  },
  {
    id: "callao-1377",
    name: "Av. Callao 1377",
    address: "Av. Callao 1377",
    neighborhood: "Recoleta",
    city: "CABA",
    phoneDisplay: "11 4815-3186",
    phoneE164: "+541148153186",
    secondaryPhoneDisplay: "11 5030-7824",
    secondaryPhoneE164: "+541150307824",
    weekdayHours: "Lunes a viernes: 9:00 a 20:00",
    saturdayHours: "Sábados: 9:30 a 13:00",
    sundayHours: "Domingos: cerrado",
    mapsQuery: "Av. Callao 1377, Recoleta, CABA",
    geo: { lat: -34.5917, lng: -58.3928 },
    openingHours: ["Mo-Fr 09:00-20:00", "Sa 09:30-13:00"],
    whatsappEnabled: false,
  },
  {
    id: "ayacucho-1762",
    name: "Ayacucho 1762",
    address: "Ayacucho 1762",
    neighborhood: "Recoleta",
    city: "CABA",
    phoneDisplay: "11 3927-1244",
    phoneE164: "+541139271244",
    weekdayHours: "Lunes a viernes: 9:00 a 20:00",
    saturdayHours: "Sábados: 9:00 a 13:00",
    sundayHours: "Domingos: cerrado",
    mapsQuery: "Ayacucho 1762, Recoleta, CABA",
    geo: { lat: -34.5888, lng: -58.3959 },
    openingHours: ["Mo-Fr 09:00-20:00", "Sa 09:00-13:00"],
    whatsappEnabled: false,
  },
];

export function mapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function mapsDirectionsUrl(query: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}

export function telHref(e164: string) {
  return `tel:${e164}`;
}

export function originUrl() {
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return "";
}

export function seoKeywords() {
  return [
    "librería Recoleta",
    "librería Callao",
    "librería escolar Recoleta",
    "papelería Recoleta",
    "librería artística Recoleta",
    "artículos de oficina Recoleta",
    "fotocopias Recoleta",
    "impresiones Recoleta",
    "útiles escolares Recoleta",
  ].join(", ");
}
