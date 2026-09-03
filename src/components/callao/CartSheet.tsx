import { Minus, Plus, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Link, useNavigate } from "@tanstack/react-router";
import { formatARS } from "./data";
import { removeFromCart, setCartQty, useShop } from "@/lib/shop-store";

export function CartSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const { cart, products } = useShop();
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full max-w-full flex-col gap-0 overflow-y-auto bg-background p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-rule px-5 py-5 text-left">
          <SheetTitle className="font-display text-2xl font-normal text-ink">Carrito</SheetTitle>
          <SheetDescription className="ui-text text-[13px]">
            {cartCount === 0
              ? "Todavía no hay productos."
              : `${cartCount} ${cartCount === 1 ? "producto" : "productos"}`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 px-5 py-5">
          {cart.length === 0 ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Agregá un título o un cuaderno desde Destacados. El total se actualiza acá.
            </p>
          ) : (
            cart.map((item) => {
              const product = products.find((p) => p.id === item.id);
              return (
                <article
                  key={item.id}
                  className="flex gap-3 border-b border-rule pb-4 last:border-0"
                >
                  {product?.image ? (
                    <img
                      src={product.image}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-sm object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-sm bg-secondary font-display text-lg italic text-sepia">
                      {item.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-display text-lg font-semibold leading-tight text-ink">
                      {item.name}
                    </h3>
                    <p className="ui-text text-[12px] text-sepia">{formatARS(item.price)}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          aria-label="Quitar uno"
                          className="rounded-sm border border-ink/20 p-1 text-ink hover:border-primary"
                          onClick={() => setCartQty(item.id, item.qty - 1)}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="ui-text w-6 text-center text-sm tabular-nums">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          aria-label="Agregar uno"
                          className="rounded-sm border border-ink/20 p-1 text-ink hover:border-primary"
                          onClick={() => setCartQty(item.id, item.qty + 1)}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="ui-text text-sm font-semibold tabular-nums text-primary">
                        {formatARS(item.price * item.qty)}
                      </span>
                      <button
                        type="button"
                        aria-label={`Quitar ${item.name}`}
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        <div className="mt-auto border-t border-rule px-5 py-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="ui-text text-sm uppercase tracking-[0.08em] text-sepia">Total</span>
            <span className="ui-text text-xl font-semibold tabular-nums text-primary">
              {formatARS(cartTotal)}
            </span>
          </div>
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={() => {
              onOpenChange(false);
              void navigate({ to: "/checkout" });
            }}
            className="ui-text w-full rounded-sm bg-primary px-4 py-3 text-[13px] uppercase tracking-[0.08em] text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Finalizar compra
          </button>
          <Link
            to="/productos"
            onClick={() => onOpenChange(false)}
            className="ui-text mt-2 block w-full rounded-sm border border-ink/20 px-4 py-3 text-center text-[13px] uppercase tracking-[0.08em] text-ink"
          >
            Seguir comprando
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
