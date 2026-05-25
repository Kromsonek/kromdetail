import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  type: "package" | "service";
  name: string;
  price: number;
};

type CartCtx = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  subtotal: number;
  discount: number;
  total: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const raw = localStorage.getItem("kd-cart");
    if (raw) try { setItems(JSON.parse(raw)); } catch {}
  }, []);
  useEffect(() => { localStorage.setItem("kd-cart", JSON.stringify(items)); }, [items]);

  const add = (item: CartItem) => setItems((prev) => (prev.find((p) => p.id === item.id) ? prev : [...prev, item]));
  const remove = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));
  const clear = () => setItems([]);

  const subtotal = items.reduce((s, i) => s + Number(i.price), 0);
  // -10% przy 3+ usługach (tylko gdy są usługi custom, nie liczymy pakietów do progu)
  const serviceCount = items.filter((i) => i.type === "service").length;
  const discount = serviceCount >= 3 ? Math.round(items.filter((i) => i.type === "service").reduce((s, i) => s + Number(i.price), 0) * 0.1 * 100) / 100 : 0;
  const total = subtotal - discount;

  return (
    <Ctx.Provider value={{ items, add, remove, clear, open, setOpen, subtotal, discount, total }}>
      {children}
    </Ctx.Provider>
  );
}
export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside provider");
  return c;
};
