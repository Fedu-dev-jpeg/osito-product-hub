import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  fetchStoreLocations,
  saveStoreLocation,
  type StoreLocation,
  type StoreLocationInput,
} from "@/lib/locations";
import { refreshLocations } from "@/lib/shop-store";

function toInput(location: StoreLocation): StoreLocationInput {
  return {
    id: location.id,
    name: location.name,
    address: location.address,
    neighborhood: location.neighborhood,
    city: location.city,
    phoneDisplay: location.phoneDisplay,
    phoneE164: location.phoneE164,
    weekdayHours: location.weekdayHours,
    saturdayHours: location.saturdayHours,
    sundayHours: location.sundayHours,
    mapsQuery: location.mapsQuery,
    lat: location.geo.lat,
    lng: location.geo.lng,
    whatsappEnabled: location.whatsappEnabled,
    reviewUrl: location.reviewUrl,
    active: location.active,
    sortOrder: location.sortOrder,
    ...(location.secondaryPhoneDisplay
      ? { secondaryPhoneDisplay: location.secondaryPhoneDisplay }
      : {}),
    ...(location.secondaryPhoneE164 ? { secondaryPhoneE164: location.secondaryPhoneE164 } : {}),
  };
}

export function LocationManager() {
  const [rows, setRows] = useState<StoreLocationInput[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const locations = await fetchStoreLocations(true);
    setRows(locations.map(toInput));
  };

  useEffect(() => {
    void load().catch((err: unknown) =>
      toast.error(err instanceof Error ? err.message : "No se pudieron cargar las sucursales."),
    );
  }, []);

  const update = (id: string, patch: Partial<StoreLocationInput>) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const save = async (row: StoreLocationInput) => {
    setBusy(true);
    try {
      await saveStoreLocation(row);
      await refreshLocations();
      toast.success("Sucursal guardada.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="rounded-md border border-rule bg-card p-5">
        <h2 className="font-display text-2xl text-ink">Sucursales</h2>
        <p className="mt-2 max-w-[60ch] text-sm text-muted-foreground">
          Estos datos alimentan la home, el footer, /sucursales y el mapa. Completá review_url solo
          cuando tengas el enlace exacto de Google. Dejalo vacío si no está confirmado.
        </p>
      </div>
      {rows.map((row) => (
        <form
          key={row.id}
          onSubmit={(e) => {
            e.preventDefault();
            void save(row);
          }}
          className="grid grid-cols-1 gap-3 rounded-md border border-rule bg-card p-5 sm:grid-cols-2"
        >
          <h3 className="font-display text-xl text-ink sm:col-span-2">{row.name || row.id}</h3>
          {(
            [
              ["name", "Nombre"],
              ["address", "Dirección"],
              ["phoneDisplay", "Teléfono"],
              ["phoneE164", "Teléfono E164"],
              ["secondaryPhoneDisplay", "Teléfono secundario"],
              ["secondaryPhoneE164", "Secundario E164"],
              ["weekdayHours", "Horario lun–vie"],
              ["saturdayHours", "Horario sábado"],
              ["sundayHours", "Horario domingo"],
              ["mapsQuery", "Consulta de mapa"],
              ["reviewUrl", "URL de reseñas (solo si está confirmada)"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="ui-text flex flex-col gap-1.5 text-[13px]">
              {label}
              <input
                value={row[key] ?? ""}
                onChange={(e) => update(row.id, { [key]: e.target.value })}
                className="h-10 rounded-sm border border-ink/25 bg-background px-3 text-sm"
              />
            </label>
          ))}
          <label className="ui-text flex flex-col gap-1.5 text-[13px]">
            Latitud
            <input
              type="number"
              step="0.0001"
              value={row.lat}
              onChange={(e) => update(row.id, { lat: Number(e.target.value) })}
              className="h-10 rounded-sm border border-ink/25 bg-background px-3 text-sm"
            />
          </label>
          <label className="ui-text flex flex-col gap-1.5 text-[13px]">
            Longitud
            <input
              type="number"
              step="0.0001"
              value={row.lng}
              onChange={(e) => update(row.id, { lng: Number(e.target.value) })}
              className="h-10 rounded-sm border border-ink/25 bg-background px-3 text-sm"
            />
          </label>
          <label className="ui-text flex flex-col gap-1.5 text-[13px]">
            Orden
            <input
              type="number"
              value={row.sortOrder}
              onChange={(e) => update(row.id, { sortOrder: Number(e.target.value) })}
              className="h-10 rounded-sm border border-ink/25 bg-background px-3 text-sm"
            />
          </label>
          <label className="ui-text flex items-center gap-2 text-[13px]">
            <input
              type="checkbox"
              checked={row.active}
              onChange={(e) => update(row.id, { active: e.target.checked })}
            />
            Activa
          </label>
          <label className="ui-text flex items-center gap-2 text-[13px]">
            <input
              type="checkbox"
              checked={row.whatsappEnabled}
              onChange={(e) => update(row.id, { whatsappEnabled: e.target.checked })}
            />
            WhatsApp habilitado
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={busy}
              className="ui-text rounded-sm bg-primary px-5 py-2.5 text-[13px] uppercase tracking-[0.08em] text-primary-foreground disabled:opacity-60"
            >
              Guardar sucursal
            </button>
          </div>
        </form>
      ))}
    </section>
  );
}
