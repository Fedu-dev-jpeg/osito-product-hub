import { pageShell } from "./data";

const footerCols = [
  { title: "Comprar", links: ["Productos", "Librería", "Escolar", "Oficina", "Papelería"] },
  {
    title: "Ayuda",
    links: ["Envíos y retiro", "Medios de pago", "Cambios y devoluciones", "Seguimiento de pedido"],
  },
  {
    title: "La casa",
    links: ["Nuestra historia", "Mi cuenta", "Venta institucional", "Trabajá con nosotros"],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative z-[2] bg-secondary">
      <div
        className={`${pageShell} grid grid-cols-1 gap-10 pb-8 pt-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-12 lg:pt-14`}
      >
        <div className="min-w-0">
          <span className="mb-3 block font-display text-xl font-medium tracking-[0.13em] text-primary">
            LIBRERÍA CALLAO
          </span>
          <p className="mb-3.5 max-w-[34ch] text-[13px] leading-[1.7] text-foreground/75">
            Av. Callao 1234, C1023 CABA
            <br />
            Lunes a sábado de 9 a 20 h
          </p>
          <p className="text-[13px] leading-[1.7] text-foreground/75">
            +54 11 4372 0000
            <br />
            hola@libreriacallao.com.ar
          </p>
        </div>
        {footerCols.map((col) => (
          <div key={col.title} className="ui-text flex min-w-0 flex-col gap-2.5">
            <span className="mb-1 text-[10.5px] uppercase tracking-[0.2em] text-gold">
              {col.title}
            </span>
            {col.links.map((link) => (
              <a
                key={link}
                href={
                  link === "Productos"
                    ? "/productos"
                    : link === "Mi cuenta"
                      ? "/auth"
                      : "/productos"
                }
                className="text-[13px] text-foreground hover:text-primary"
              >
                {link}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div
        className={`${pageShell} ui-text flex flex-col gap-3 border-t border-rule pb-8 pt-4 text-[11.5px] text-muted-foreground md:flex-row md:items-center md:justify-between`}
      >
        <span>© 2026 Librería Callao · Buenos Aires, Argentina</span>
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          <span>Precios en pesos argentinos (ARS), IVA incluido</span>
          <a href="/productos" className="hover:text-ink">
            Términos
          </a>
          <a href="/productos" className="hover:text-ink">
            Privacidad
          </a>
        </div>
      </div>
    </footer>
  );
}
