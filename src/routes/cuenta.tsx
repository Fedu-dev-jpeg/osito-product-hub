import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/callao/RequireAuth";
import { SiteFooter } from "@/components/callao/SiteFooter";
import { SiteHeader } from "@/components/callao/SiteHeader";
import { formatARS, pageShell } from "@/components/callao/data";
import { useAuth } from "@/lib/auth";
import {
  fetchOrders,
  listDiscounts,
  orderStatusLabel,
  type DiscountCode,
  type OrderRow,
} from "@/lib/orders";

export const Route = createFileRoute("/cuenta")({
  head: () => ({
    meta: [{ title: "Mi cuenta — Librería Callao" }, { name: "robots", content: "noindex" }],
  }),
  component: CuentaPage,
});

function CuentaPage() {
  return (
    <RequireAuth>
      <CuentaDashboard />
    </RequireAuth>
  );
}

function CuentaDashboard() {
  const { profile, user, signOut } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    void fetchOrders(profile?.role === "admin" ? undefined : user.id)
      .then(setOrders)
      .catch((err: unknown) =>
        toast.error(err instanceof Error ? err.message : "No se pudieron cargar los pedidos."),
      );
    void listDiscounts()
      .then(setCodes)
      .catch(() => setCodes([]));
  }, [user, profile?.role]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className={`${pageShell} py-8 md:py-10`}>
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-rule pb-6">
          <div>
            <p className="ui-text text-[11px] uppercase tracking-[0.2em] text-gold">Mi cuenta</p>
            <h1 className="font-display text-4xl text-ink">Pedidos y códigos</h1>
            <p className="mt-1 text-sm text-muted-foreground">{profile?.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile?.role === "admin" ? (
              <Link
                to="/admin"
                className="ui-text rounded-sm border border-primary px-4 py-2.5 text-[13px] text-primary"
              >
                Panel admin
              </Link>
            ) : null}
            <Link
              to="/productos"
              className="ui-text rounded-sm border border-ink/20 px-4 py-2.5 text-[13px]"
            >
              Seguir comprando
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className="ui-text rounded-sm bg-primary px-4 py-2.5 text-[13px] uppercase tracking-[0.08em] text-primary-foreground"
            >
              Salir
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.8fr)]">
          <section className="rounded-md border border-rule bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl text-ink">Pedidos</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Cada compra genera un código de pedido para seguimiento.
            </p>
            {orders.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">
                Todavía no hay pedidos.{" "}
                <Link to="/productos" className="text-primary">
                  Ir al catálogo
                </Link>
              </p>
            ) : (
              <ul className="mt-5 divide-y divide-rule">
                {orders.map((order) => (
                  <li key={order.id} className="py-4">
                    <button
                      type="button"
                      className="flex w-full items-start justify-between gap-3 text-left"
                      onClick={() => setOpenId(openId === order.id ? null : order.id)}
                    >
                      <div>
                        <p className="font-display text-xl text-ink">{order.code}</p>
                        <p className="ui-text text-[12px] text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("es-AR")} ·{" "}
                          {order.fulfillment === "envio" ? "Envío" : "Retiro"} ·{" "}
                          {orderStatusLabel[order.status]}
                        </p>
                      </div>
                      <span className="ui-text text-sm font-semibold tabular-nums text-primary">
                        {formatARS(order.total)}
                      </span>
                    </button>
                    {openId === order.id ? (
                      <ul className="mt-3 space-y-1 text-sm text-foreground/80">
                        {(order.items ?? []).map((item) => (
                          <li key={item.id}>
                            {item.quantity} × {item.name} — {formatARS(item.unit_price)}
                          </li>
                        ))}
                        {order.discount_code ? (
                          <li className="ui-text text-[12px] text-gold">
                            Código {order.discount_code}
                          </li>
                        ) : null}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-md border border-rule bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl text-ink">Códigos</h2>
            <p className="mt-1 text-sm text-muted-foreground">Aplicálos al finalizar la compra.</p>
            <ul className="mt-5 space-y-3">
              {codes.map((code) => (
                <li key={code.code} className="rounded-sm border border-rule px-3 py-3">
                  <p className="ui-text text-[13px] font-semibold tracking-[0.08em] text-primary">
                    {code.code}
                  </p>
                  <p className="text-sm text-muted-foreground">{code.description}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
