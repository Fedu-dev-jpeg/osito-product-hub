import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/callao/RequireAuth";
import { SiteFooter } from "@/components/callao/SiteFooter";
import { SiteHeader } from "@/components/callao/SiteHeader";
import { formatARS, pageShell } from "@/components/callao/data";
import { useAuth } from "@/lib/auth";
import { lookupDiscount, placeOrder, quoteOrder, type DiscountCode } from "@/lib/orders";
import { clearCart, getSettings, useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [{ title: "Checkout — Librería Callao" }, { name: "robots", content: "noindex" }],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  return (
    <RequireAuth>
      <CheckoutForm />
    </RequireAuth>
  );
}

function CheckoutForm() {
  const { user } = useAuth();
  const { cart, products } = useShop();
  const navigate = useNavigate();
  const settings = getSettings();
  const [fulfillment, setFulfillment] = useState<"retiro" | "envio">("retiro");
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<DiscountCode | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const totals = useMemo(
    () => quoteOrder(cart, fulfillment, coupon, settings.freeShippingFrom),
    [cart, fulfillment, coupon, settings.freeShippingFrom],
  );

  const applyCode = async () => {
    try {
      const found = await lookupDiscount(code);
      if (!found) {
        setCoupon(null);
        toast.error("Ese código no es válido.");
        return;
      }
      setCoupon(found);
      toast.success(`Aplicamos ${found.code}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo aplicar el código.");
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    if (!cart.length) {
      toast.error("El carrito está vacío.");
      return;
    }
    setBusy(true);
    try {
      const order = await placeOrder({
        customerId: user.id,
        cart,
        products,
        fulfillment,
        coupon,
        notes,
        totals,
      });
      clearCart();
      toast.success(`Pedido ${order.code} confirmado.`);
      void navigate({ to: "/cuenta" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo crear el pedido.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className={`${pageShell} py-8 md:py-10`}>
        <nav className="ui-text text-[12px] text-sepia">
          <Link to="/productos" className="hover:text-ink">
            Productos
          </Link>
          <span className="px-2">/</span>
          <span className="text-ink">Checkout</span>
        </nav>
        <h1 className="mt-4 font-display text-4xl text-ink">Finalizar compra</h1>
        {cart.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            No hay productos en el carrito.{" "}
            <Link to="/productos" className="text-primary">
              Ver catálogo
            </Link>
          </p>
        ) : (
          <form
            onSubmit={(e) => void onSubmit(e)}
            className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
          >
            <section className="rounded-md border border-rule bg-card p-5 md:p-6">
              <h2 className="font-display text-2xl text-ink">Entrega</h2>
              <div className="mt-4 flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={fulfillment === "retiro"}
                    onChange={() => setFulfillment("retiro")}
                  />
                  Retiro en Av. Callao 1234
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={fulfillment === "envio"}
                    onChange={() => setFulfillment("envio")}
                  />
                  Envío a domicilio
                </label>
              </div>
              <label className="ui-text mt-5 block text-[12px] text-sepia">
                Código de descuento
                <div className="mt-1 flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="CALLAO10"
                    className="h-10 flex-1 rounded-sm border border-ink/20 px-3 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => void applyCode()}
                    className="ui-text rounded-sm border border-ink/20 px-3 text-[12px] uppercase"
                  >
                    Aplicar
                  </button>
                </div>
              </label>
              <label className="ui-text mt-4 block text-[12px] text-sepia">
                Notas del pedido
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-sm border border-ink/20 px-3 py-2 text-sm"
                />
              </label>
            </section>
            <section className="rounded-md border border-rule bg-card p-5 md:p-6">
              <h2 className="font-display text-2xl text-ink">Resumen</h2>
              <ul className="mt-4 divide-y divide-rule">
                {cart.map((item) => (
                  <li key={item.id} className="flex justify-between py-2 text-sm">
                    <span>
                      {item.qty} × {item.name}
                    </span>
                    <span className="tabular-nums">{formatARS(item.price * item.qty)}</span>
                  </li>
                ))}
              </ul>
              <dl className="ui-text mt-4 space-y-1 text-[13px]">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="tabular-nums">{formatARS(totals.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Envío</dt>
                  <dd className="tabular-nums">{formatARS(totals.shipping)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Descuento</dt>
                  <dd className="tabular-nums">−{formatARS(totals.discount)}</dd>
                </div>
                <div className="flex justify-between font-semibold text-primary">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatARS(totals.total)}</dd>
                </div>
              </dl>
              <button
                type="submit"
                disabled={busy}
                className="ui-text mt-5 h-11 w-full rounded-sm bg-primary text-[13px] uppercase tracking-[0.08em] text-primary-foreground disabled:opacity-60"
              >
                Pagar y confirmar
              </button>
            </section>
          </form>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
