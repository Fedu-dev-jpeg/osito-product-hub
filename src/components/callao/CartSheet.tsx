import { Minus, Plus, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatARS } from "./data";
import { useCallao } from "./callao-store";

export function CartSheet() {
  const { cartOpen, setCartOpen, cartLines, cartCount, cartTotal, setQty, removeFromCart } =
    useCallao();

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
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
          {cartLines.length === 0 ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Agregá un título o un cuaderno desde Destacados. El total se actualiza acá.
            </p>
          ) : (
            cartLines.map(({ product, qty, lineTotal }) => (
              <article
                key={product.id}
                className="flex gap-3 border-b border-rule pb-4 last:border-0"
              >
                <img
                  src={product.image}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-sm object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display text-lg font-semibold leading-tight text-ink">
                    {product.name}
                  </h3>
                  <p className="ui-text text-[12px] text-sepia">{formatARS(product.price)}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label="Quitar uno"
                        className="rounded-sm border border-ink/20 p-1 text-ink hover:border-primary"
                        onClick={() => setQty(product.id, qty - 1)}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="ui-text w-6 text-center text-sm tabular-nums">{qty}</span>
                      <button
                        type="button"
                        aria-label="Agregar uno"
                        className="rounded-sm border border-ink/20 p-1 text-ink hover:border-primary"
                        onClick={() => setQty(product.id, qty + 1)}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="ui-text text-sm font-semibold tabular-nums text-primary">
                      {formatARS(lineTotal)}
                    </span>
                    <button
                      type="button"
                      aria-label={`Quitar ${product.name}`}
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart(product.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </article>
            ))
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
            onClick={() => setCartOpen(false)}
            className="ui-text w-full rounded-sm bg-primary px-4 py-3 text-[13px] uppercase tracking-[0.08em] text-primary-foreground hover:bg-primary/90"
          >
            Seguir comprando
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
