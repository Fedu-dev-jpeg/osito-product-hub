import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ChangeEvent } from "react";
import { SiteFooter } from "@/components/callao/SiteFooter";
import { SiteHeader } from "@/components/callao/SiteHeader";
import { MobileStickyCta, WhatsAppFloat } from "@/components/callao/WhatsAppFloat";
import { pageShell } from "@/components/callao/data";
import { SITE_NAME } from "@/lib/site";
import { track, useShop } from "@/lib/shop-store";
import { whatsappUrl } from "@/lib/whatsapp";

export const Route = createFileRoute("/lista-escolar")({
  head: () => ({
    meta: [
      { title: `Lista escolar — ${SITE_NAME}` },
      {
        name: "description",
        content: "Mandanos tu lista escolar por WhatsApp y te ayudamos a encontrar todo lo que necesitás.",
      },
    ],
    links: [{ rel: "canonical", href: "/lista-escolar" }],
  }),
  component: ListaEscolarPage,
});

function ListaEscolarPage() {
  const { settings } = useShop();
  const [files, setFiles] = useState<File[]>([]);
  const href = whatsappUrl({ kind: "school" }, settings.whatsapp);

  const onFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(event.target.files ?? []).filter((file) =>
      /pdf|jpeg|jpg|png/i.test(file.type || file.name),
    );
    setFiles(list);
  };

  return (
    <div className="grain min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className={`${pageShell} py-12 md:py-16`}>
        <nav className="ui-text text-[12px] text-sepia">
          <Link to="/" className="hover:text-ink">
            Inicio
          </Link>
          <span className="px-2">/</span>
          <span className="text-ink">Lista escolar</span>
        </nav>
        <h1 className="mt-4 font-display text-4xl text-ink md:text-5xl">¿Tenés una lista escolar?</h1>
        <p className="mt-4 max-w-[56ch] text-[16px] leading-relaxed text-foreground/80">
          Mandanos tu lista y te ayudamos a encontrar todo lo que necesitás.
        </p>

        <form
          className="mt-8 max-w-xl rounded-md border border-rule bg-card p-5 md:p-6"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className="ui-text block text-[13px] text-ink">
            Adjuntar lista (PDF, JPG o PNG)
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              multiple
              onChange={onFiles}
              className="mt-2 block w-full text-sm file:mr-3 file:rounded-sm file:border file:border-ink/25 file:bg-background file:px-3 file:py-2"
            />
          </label>
          {files.length ? (
            <ul className="mt-3 list-disc pl-5 text-sm text-foreground/75">
              {files.map((file) => (
                <li key={file.name}>{file.name}</li>
              ))}
            </ul>
          ) : null}
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            WhatsApp se abre con el mensaje listo. Si tenés un archivo, adjuntalo ahí en la conversación.
          </p>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            onClick={() => track("send_school_list", { files: files.length })}
            className="ui-text mt-5 inline-flex min-h-12 items-center rounded-sm bg-primary px-6 text-[13px] uppercase tracking-[0.08em] text-primary-foreground"
          >
            Enviar lista por WhatsApp
          </a>
        </form>
      </div>
      <SiteFooter />
      <WhatsAppFloat context={{ kind: "school" }} />
      <MobileStickyCta />
    </div>
  );
}
