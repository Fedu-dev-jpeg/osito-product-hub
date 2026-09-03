import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import {
  deleteHeroSlide,
  fetchHeroSlides,
  reorderHeroSlides,
  saveHeroSlide,
  uploadHeroImage,
  type HeroSlide,
} from "@/lib/hero";
import { refreshHero } from "@/lib/shop-store";

const empty = {
  eyebrow: "",
  title: "",
  description: "",
  ctaLabel: "Ver productos",
  ctaUrl: "/productos",
  secondaryCtaLabel: "",
  secondaryCtaUrl: "",
  imageUrl: "",
  active: true,
  sortOrder: 0,
};

export function HeroManager() {
  const { user } = useAuth();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [form, setForm] = useState({ ...empty, id: "" });
  const [busy, setBusy] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  const load = async () => {
    setSlides(await fetchHeroSlides(true));
  };

  useEffect(() => {
    void load().catch((err: unknown) =>
      toast.error(err instanceof Error ? err.message : "No se pudieron cargar los banners."),
    );
  }, []);

  const onSave = async () => {
    if (!form.title.trim()) {
      toast.error("El título es obligatorio.");
      return;
    }
    setBusy(true);
    try {
      await saveHeroSlide({
        ...(form.id ? { id: form.id } : {}),
        eyebrow: form.eyebrow,
        title: form.title,
        description: form.description,
        ctaLabel: form.ctaLabel,
        ctaUrl: form.ctaUrl,
        secondaryCtaLabel: form.secondaryCtaLabel,
        secondaryCtaUrl: form.secondaryCtaUrl,
        imageUrl: form.imageUrl,
        active: form.active,
        sortOrder: form.sortOrder || slides.length + 1,
      });
      setForm({ ...empty, id: "" });
      await load();
      await refreshHero();
      toast.success("Slide guardado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setBusy(false);
    }
  };

  const onDrop = async (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const ids = slides.map((slide) => slide.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    ids.splice(from, 1);
    ids.splice(to, 0, dragId);
    setSlides(ids.map((id, index) => ({ ...slides.find((s) => s.id === id)!, sortOrder: index + 1 })));
    try {
      await reorderHeroSlides(ids);
      await refreshHero();
      toast.success("Orden guardado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo reordenar.");
    }
    setDragId(null);
  };

  return (
    <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div className="rounded-md border border-rule bg-card p-5">
        <h2 className="font-display text-2xl text-ink">{form.id ? "Editar slide" : "Nuevo slide"}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          El hero público usa estos slides. Si no hay ninguno activo, se muestran los textos
          institucionales por defecto. No cargues promociones no confirmadas.
        </p>
        <div className="mt-4 grid gap-3">
          {(
            [
              ["eyebrow", "Eyebrow"],
              ["title", "Título"],
              ["description", "Descripción"],
              ["ctaLabel", "CTA principal"],
              ["ctaUrl", "URL del CTA"],
              ["secondaryCtaLabel", "CTA secundario"],
              ["secondaryCtaUrl", "URL del CTA secundario"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="ui-text flex flex-col gap-1.5 text-[13px]">
              {label}
              {key === "description" ? (
                <textarea
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  rows={3}
                  className="rounded-sm border border-ink/25 bg-background px-3 py-2 text-sm"
                />
              ) : (
                <input
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="h-10 rounded-sm border border-ink/25 bg-background px-3 text-sm"
                />
              )}
            </label>
          ))}
          <label className="ui-text flex flex-col gap-1.5 text-[13px]">
            Imagen
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file || !user) return;
                void uploadHeroImage(file, user.id)
                  .then((url) => {
                    setForm((current) => ({ ...current, imageUrl: url }));
                    toast.success("Imagen subida.");
                  })
                  .catch((err: unknown) =>
                    toast.error(err instanceof Error ? err.message : "No se pudo subir."),
                  );
              }}
            />
          </label>
          {form.imageUrl ? (
            <img src={form.imageUrl} alt="" className="h-28 w-full rounded-sm object-cover" />
          ) : null}
          <label className="ui-text flex items-center gap-2 text-[13px]">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Activo
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void onSave()}
              className="ui-text rounded-sm bg-primary px-5 py-2.5 text-[13px] uppercase tracking-[0.08em] text-primary-foreground disabled:opacity-60"
            >
              Guardar slide
            </button>
            {form.id ? (
              <button
                type="button"
                onClick={() => setForm({ ...empty, id: "" })}
                className="ui-text rounded-sm border border-ink/20 px-5 py-2.5 text-[13px] uppercase tracking-[0.08em]"
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-md border border-rule bg-card p-5">
        <h2 className="font-display text-2xl text-ink">Slides ({slides.length})</h2>
        <p className="mt-2 text-sm text-muted-foreground">Arrastrá para reordenar. El orden se guarda solo.</p>
        <ul className="mt-4 space-y-3">
          {slides.map((slide) => (
            <li
              key={slide.id}
              draggable
              onDragStart={() => setDragId(slide.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => void onDrop(slide.id)}
              className="flex gap-3 rounded-sm border border-rule p-3"
            >
              {slide.imageUrl ? (
                <img src={slide.imageUrl} alt="" className="h-16 w-20 rounded-sm object-cover" />
              ) : (
                <div className="flex h-16 w-20 items-center justify-center bg-secondary text-xs text-sepia">
                  Sin foto
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg text-ink">{slide.title}</p>
                <p className="text-xs text-muted-foreground">
                  {slide.active ? "Activo" : "Inactivo"} · {slide.ctaLabel}
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    className="ui-text text-[11px] uppercase tracking-[0.08em] text-primary"
                    onClick={() => setForm({ ...slide })}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="ui-text text-[11px] uppercase tracking-[0.08em] text-sepia"
                    onClick={() => {
                      if (!window.confirm("¿Eliminar este slide?")) return;
                      void deleteHeroSlide(slide.id)
                        .then(() => load())
                        .then(() => refreshHero())
                        .then(() => toast.success("Slide eliminado."))
                        .catch((err: unknown) =>
                          toast.error(err instanceof Error ? err.message : "No se pudo eliminar."),
                        );
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {form.title ? (
          <div className="mt-6 border-t border-rule pt-4">
            <p className="ui-text text-[11px] uppercase tracking-[0.16em] text-gold">Vista previa</p>
            <p className="mt-2 text-xs text-gold">{form.eyebrow}</p>
            <p className="font-display text-2xl text-ink">{form.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{form.description}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
