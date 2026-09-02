import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";

export type Product = {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  image: string;
  badge?: string;
};

export const products: Product[] = [
  {
    id: "p1",
    category: "Librería · Ensayo",
    name: "El arte de la lectura lenta",
    description: "Ensayos sobre el oficio de leer. Tapa dura, 312 páginas.",
    price: 24900,
    image: p1,
    badge: "Novedad",
  },
  {
    id: "p2",
    category: "Papelería · Cuadernos",
    name: "Cuaderno Callao A5",
    description: "Papel marfil 100 g, hoja punteada. Cosido y con elástico.",
    price: 18400,
    image: p2,
  },
  {
    id: "p3",
    category: "Escritura · Plumas",
    name: "Pluma fuente Recoleta F",
    description: "Trazo fino, resina veteada. Incluye dos cartuchos y converter.",
    price: 67500,
    image: p3,
  },
  {
    id: "p4",
    category: "Escolar · Marcadores",
    name: "Resaltadores tono tierra ×6",
    description: "Punta biselada, tinta al agua. No traspasa el papel fino.",
    price: 9750,
    image: p4,
  },
  {
    id: "p5",
    category: "Agendas · 2026",
    name: "Agenda semanal 2026",
    description: "Semana a la vista, feriados argentinos y 16 hojas de notas.",
    price: 31200,
    image: p5,
  },
];

export const formatARS = (value: number) =>
  "$" + value.toLocaleString("es-AR", { maximumFractionDigits: 0 });

export const navLinks = ["Librería", "Escolar", "Oficina", "Papelería", "Agendas"];
