import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { EMAIL_RE, products as seedProducts, type Product } from "@/components/callao/data";
import {
  STORAGE_KEYS,
  defaultSettings,
  loadJson,
  loadProducts,
  loadSettings,
  newId,
  saveJson,
  type CallaoSettings,
  type CartItem,
  type TrackingEvent,
  type TrackingType,
} from "@/lib/callao-storage";

type CallaoContextValue = {
  ready: boolean;
  products: Product[];
  cart: CartItem[];
  settings: CallaoSettings;
  events: TrackingEvent[];
  lastEvent: TrackingEvent | null;
  searches: string[];
  cartAdds: number;
  subscriptions: string[];
  adminEvents: TrackingEvent[];
  searchQuery: string;
  activeGroup: string;
  cartOpen: boolean;
  cartCount: number;
  cartTotal: number;
  cartLines: Array<{ product: Product; qty: number; lineTotal: number }>;
  setSearchQuery: (query: string) => void;
  setActiveGroup: (group: string) => void;
  setCartOpen: (open: boolean) => void;
  trackSearch: (query: string) => void;
  addToCart: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  subscribeNewsletter: (email: string) => { ok: true } | { ok: false; error: string };
  upsertProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  saveSettings: (next: CallaoSettings) => void;
  trackAdmin: (label: string) => void;
  trackClick: (label: string) => void;
};

const CallaoContext = createContext<CallaoContextValue | null>(null);

const MAX_EVENTS = 200;

export function CallaoProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [settings, setSettings] = useState<CallaoSettings>(defaultSettings);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [lastEvent, setLastEvent] = useState<TrackingEvent | null>(null);
  const [searches, setSearches] = useState<string[]>([]);
  const [cartAdds, setCartAdds] = useState(0);
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const [adminEvents, setAdminEvents] = useState<TrackingEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState("Todos");
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    setProducts(loadProducts());
    setCart(loadJson<CartItem[]>(STORAGE_KEYS.cart, []));
    setSettings(loadSettings());
    setEvents(loadJson<TrackingEvent[]>(STORAGE_KEYS.events, []));
    setLastEvent(loadJson<TrackingEvent | null>(STORAGE_KEYS.lastEvent, null));
    setSearches(loadJson<string[]>(STORAGE_KEYS.searches, []));
    setCartAdds(loadJson<number>(STORAGE_KEYS.cartAdds, 0));
    setSubscriptions(loadJson<string[]>(STORAGE_KEYS.subscriptions, []));
    setAdminEvents(loadJson<TrackingEvent[]>(STORAGE_KEYS.adminEvents, []));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveJson(STORAGE_KEYS.products, products);
  }, [ready, products]);

  useEffect(() => {
    if (!ready) return;
    saveJson(STORAGE_KEYS.cart, cart);
  }, [ready, cart]);

  useEffect(() => {
    if (!ready) return;
    saveJson(STORAGE_KEYS.settings, settings);
  }, [ready, settings]);

  useEffect(() => {
    if (!ready) return;
    saveJson(STORAGE_KEYS.events, events);
  }, [ready, events]);

  useEffect(() => {
    if (!ready) return;
    saveJson(STORAGE_KEYS.lastEvent, lastEvent);
  }, [ready, lastEvent]);

  useEffect(() => {
    if (!ready) return;
    saveJson(STORAGE_KEYS.searches, searches);
  }, [ready, searches]);

  useEffect(() => {
    if (!ready) return;
    saveJson(STORAGE_KEYS.cartAdds, cartAdds);
  }, [ready, cartAdds]);

  useEffect(() => {
    if (!ready) return;
    saveJson(STORAGE_KEYS.subscriptions, subscriptions);
  }, [ready, subscriptions]);

  useEffect(() => {
    if (!ready) return;
    saveJson(STORAGE_KEYS.adminEvents, adminEvents);
  }, [ready, adminEvents]);

  const record = useCallback((type: TrackingType, label: string) => {
    const event: TrackingEvent = {
      id: newId("evt"),
      type,
      label,
      at: Date.now(),
    };
    setLastEvent(event);
    setEvents((prev) => [event, ...prev].slice(0, MAX_EVENTS));
    if (type === "admin") {
      setAdminEvents((adminPrev) => [event, ...adminPrev].slice(0, MAX_EVENTS));
    }
  }, []);

  const trackSearch = useCallback(
    (query: string) => {
      const q = query.trim();
      if (!q) return;
      setSearches((prev) => [q, ...prev.filter((item) => item !== q)].slice(0, 50));
      record("search", q);
    },
    [record],
  );

  const addToCart = useCallback(
    (productId: string) => {
      const product = products.find((item) => item.id === productId);
      setCart((prev) => {
        const existing = prev.find((item) => item.productId === productId);
        if (existing) {
          return prev.map((item) =>
            item.productId === productId ? { ...item, qty: item.qty + 1 } : item,
          );
        }
        return [...prev, { productId, qty: 1 }];
      });
      setCartAdds((n) => n + 1);
      record("add_to_cart", product?.name ?? productId);
      toast.success(product ? `Agregaste ${product.name}` : "Agregado al carrito");
    },
    [products, record],
  );

  const setQty = useCallback((productId: string, qty: number) => {
    setCart((prev) => {
      if (qty <= 0) return prev.filter((item) => item.productId !== productId);
      return prev.map((item) => (item.productId === productId ? { ...item, qty } : item));
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const subscribeNewsletter = useCallback(
    (email: string): { ok: true } | { ok: false; error: string } => {
      const value = email.trim().toLowerCase();
      if (!EMAIL_RE.test(value)) {
        return { ok: false, error: "Ingresá un correo válido." };
      }
      if (subscriptions.includes(value)) {
        return { ok: false, error: "Este correo ya está suscripto." };
      }
      setSubscriptions((prev) => [value, ...prev]);
      record("subscribe", value);
      toast.success("Listo. Te escribimos el mes que viene.");
      return { ok: true };
    },
    [record, subscriptions],
  );

  const upsertProduct = useCallback((product: Product) => {
    setProducts((prev) => {
      const index = prev.findIndex((item) => item.id === product.id);
      if (index === -1) return [product, ...prev];
      return prev.map((item) => (item.id === product.id ? product : item));
    });
  }, []);

  const deleteProduct = useCallback((productId: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== productId));
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const saveSettings = useCallback((next: CallaoSettings) => {
    setSettings(next);
  }, []);

  const trackAdmin = useCallback(
    (label: string) => {
      record("admin", label);
    },
    [record],
  );

  const trackClick = useCallback(
    (label: string) => {
      record("click", label);
    },
    [record],
  );

  const cartLines = useMemo(() => {
    return cart.flatMap((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return [];
      return [{ product, qty: item.qty, lineTotal: product.price * item.qty }];
    });
  }, [cart, products]);

  const cartCount = useMemo(() => cartLines.reduce((sum, line) => sum + line.qty, 0), [cartLines]);
  const cartTotal = useMemo(
    () => cartLines.reduce((sum, line) => sum + line.lineTotal, 0),
    [cartLines],
  );

  const value = useMemo<CallaoContextValue>(
    () => ({
      ready,
      products,
      cart,
      settings,
      events,
      lastEvent,
      searches,
      cartAdds,
      subscriptions,
      adminEvents,
      searchQuery,
      activeGroup,
      cartOpen,
      cartCount,
      cartTotal,
      cartLines,
      setSearchQuery,
      setActiveGroup,
      setCartOpen,
      trackSearch,
      addToCart,
      setQty,
      removeFromCart,
      subscribeNewsletter,
      upsertProduct,
      deleteProduct,
      saveSettings,
      trackAdmin,
      trackClick,
    }),
    [
      ready,
      products,
      cart,
      settings,
      events,
      lastEvent,
      searches,
      cartAdds,
      subscriptions,
      adminEvents,
      searchQuery,
      activeGroup,
      cartOpen,
      cartCount,
      cartTotal,
      cartLines,
      trackSearch,
      addToCart,
      setQty,
      removeFromCart,
      subscribeNewsletter,
      upsertProduct,
      deleteProduct,
      saveSettings,
      trackAdmin,
      trackClick,
    ],
  );

  return <CallaoContext.Provider value={value}>{children}</CallaoContext.Provider>;
}

export function useCallao() {
  const ctx = useContext(CallaoContext);
  if (!ctx) {
    throw new Error("useCallao must be used within CallaoProvider");
  }
  return ctx;
}
