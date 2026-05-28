import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { X } from "lucide-react";
import { useState } from "react";
import { OrderForm } from "./OrderForm";
import { Checkbox } from "@/components/ui/checkbox";

export function CartDrawer() {
  const { items, remove, open, setOpen, subtotal, discount, total } = useCart();
  const [orderOpen, setOrderOpen] = useState(false);
  const [consent, setConsent] = useState(false);
  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex flex-col w-full sm:max-w-md">
          <SheetHeader><SheetTitle className="font-display text-2xl">Twój koszyk</SheetTitle></SheetHeader>
          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {items.length === 0 && <p className="text-sm text-muted-foreground">Koszyk jest pusty.</p>}
            {items.map((i) => (
              <div key={i.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card">
                <div>
                  <p className="font-medium text-sm">{i.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{i.type === "package" ? "Pakiet" : "Usługa"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-display">{Number(i.price).toFixed(0)} zł</span>
                  <button onClick={() => remove(i.id)} aria-label="Usuń"><X className="h-4 w-4 opacity-60 hover:opacity-100" /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>Suma</span><span>{subtotal.toFixed(0)} zł</span></div>
            {discount > 0 && <div className="flex justify-between text-[color:var(--gold)]"><span>Rabat -10%</span><span>-{discount.toFixed(0)} zł</span></div>}
            <div className="flex justify-between font-display text-2xl pt-2"><span>Razem</span><span>{total.toFixed(0)} zł</span></div>
            <p className="text-xs text-center text-muted-foreground pt-1">💳 Każda forma płatności na miejscu</p>
            <label className="flex items-start gap-2 text-xs bg-muted/40 border rounded-md p-2 mt-2 cursor-pointer">
              <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" />
              <span>Wyrażam zgodę, aby pracę detailingową wykonała <strong>osoba niepełnoletnia</strong> (wymagane).</span>
            </label>
            <Button disabled={items.length === 0 || !consent} className="w-full h-12 btn-gold mt-3" onClick={() => { setOpen(false); setOrderOpen(true); }}>
              Przejdź do realizacji
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <OrderForm open={orderOpen} onOpenChange={setOrderOpen} />
    </>
  );
}
