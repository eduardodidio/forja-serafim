import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { FOIL_EXTRA, getCard } from "./store-data";

export type CartItem = { cardId: string; foil: boolean; qty: number };

type StoreValue = {
  items: CartItem[];
  favorites: string[];
  ready: boolean;
  add: (cardId: string, foil: boolean, qty?: number) => void;
  setQty: (cardId: string, foil: boolean, qty: number) => void;
  remove: (cardId: string, foil: boolean) => void;
  clear: () => void;
  toggleFavorite: (cardId: string) => void;
  count: number;
  subtotal: number;
};

const StoreContext = createContext<StoreValue | null>(null);

const CART_KEY = "serafim.cart";
const FAV_KEY = "serafim.favorites";

export function unitPrice(cardId: string, foil: boolean) {
  const card = getCard(cardId);
  if (!card) return 0;
  return card.price + (foil ? FOIL_EXTRA : 0);
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const c = localStorage.getItem(CART_KEY);
      if (c) setItems(JSON.parse(c));
      const f = localStorage.getItem(FAV_KEY);
      if (f) setFavorites(JSON.parse(f));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, ready]);

  useEffect(() => {
    if (ready) localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
  }, [favorites, ready]);

  const add = useCallback((cardId: string, foil: boolean, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.cardId === cardId && i.foil === foil);
      if (idx === -1) return [...prev, { cardId, foil, qty }];
      const next = [...prev];
      next[idx] = { ...next[idx], qty: next[idx].qty + qty };
      return next;
    });
  }, []);

  const setQty = useCallback((cardId: string, foil: boolean, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => !(i.cardId === cardId && i.foil === foil))
        : prev.map((i) => (i.cardId === cardId && i.foil === foil ? { ...i, qty } : i)),
    );
  }, []);

  const remove = useCallback((cardId: string, foil: boolean) => {
    setItems((prev) => prev.filter((i) => !(i.cardId === cardId && i.foil === foil)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const toggleFavorite = useCallback((cardId: string) => {
    setFavorites((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId],
    );
  }, []);

  const value = useMemo<StoreValue>(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + unitPrice(i.cardId, i.foil) * i.qty, 0);
    return {
      items,
      favorites,
      ready,
      add,
      setQty,
      remove,
      clear,
      toggleFavorite,
      count,
      subtotal,
    };
  }, [items, favorites, ready, add, setQty, remove, clear, toggleFavorite]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
