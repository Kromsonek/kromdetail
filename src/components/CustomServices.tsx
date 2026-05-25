import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

type Service = { id: string; name: string; description: string | null; price: number };

const MIN_ORDER = 199;

export function CustomServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const { add, setOpen } = useCart();

  useEffect(() => {
    supabase.from("services").select("*").order("sort_order").then(({ data }) => {
      if (data) setServices(data as unknown as Service[]);
    });
  }, []);

  const selectedList = services.filter((s) => selected[s.id]);
  const sum = selectedList.reduce((a, b) => a + Number(b.price), 0);
  const discount = selectedList.length >= 3 ? sum * 0.1 : 0;
  const total = sum - discount;

  const addAll = () => {
    if (total < MIN_ORDER) {
      toast.error(`Minimalna wartość zamówienia to ${MIN_ORDER} zł`);
      return;
    }
    selectedList.forEach((s) => add({ id: `svc-${s.id}`, type: "service", name: s.name, price: Number(s.price) }));
    toast.success(`Dodano ${selectedList.length} usługi do koszyka`);
    setSelected({});
    setOpen(true);
  };

  return (
    <section id="custom" className="py-24">
      <div className="container mx-auto px-4 grid lg:grid-cols-[1fr_400px] gap-10">
        <div>
          <p className="text-[color:var(--gold)] uppercase tracking-[0.25em] text-xs mb-3">Krom Custom</p>
          <h2 className="font-display text-4xl md:text-5xl">Złóż swój własny pakiet</h2>
          <p className="mt-4 text-muted-foreground max-w-xl">
            Zaznacz interesujące Cię usługi. Przy 3+ pozycjach otrzymujesz <strong className="text-foreground">automatycznie -10%</strong>.
            Minimalna wartość zamówienia to {MIN_ORDER} zł.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 gap-3">
            {services.map((s) => (
              <label key={s.id} className={`flex items-start gap-3 p-4 rounded-xl border bg-card cursor-pointer transition-all ${selected[s.id] ? "border-[color:var(--gold)] ring-1 ring-[color:var(--gold)]" : "hover:border-foreground/30"}`}>
                <Checkbox checked={!!selected[s.id]} onCheckedChange={(v) => setSelected((p) => ({ ...p, [s.id]: !!v }))} className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium">{s.name}</span>
                    <span className="font-display text-lg">{Number(s.price).toFixed(0)} zł</span>
                  </div>
                  {s.description && <p className="text-xs text-muted-foreground mt-1">{s.description}</p>}
                </div>
              </label>
            ))}
          </div>
        </div>
        <aside className="lg:sticky lg:top-24 h-fit rounded-2xl border bg-card p-6">
          <h3 className="font-display text-2xl">Podsumowanie</h3>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>Wybrane usługi</span><span>{selectedList.length}</span></div>
            <div className="flex justify-between"><span>Suma</span><span>{sum.toFixed(0)} zł</span></div>
            {discount > 0 && <div className="flex justify-between text-[color:var(--gold)]"><span>Rabat -10%</span><span>-{discount.toFixed(0)} zł</span></div>}
            <div className="border-t pt-3 mt-3 flex justify-between font-display text-2xl"><span>Razem</span><span>{total.toFixed(0)} zł</span></div>
          </div>
          {total > 0 && total < MIN_ORDER && (
            <p className="mt-3 text-xs text-destructive">Minimum {MIN_ORDER} zł — dobierz jeszcze {(MIN_ORDER - total).toFixed(0)} zł</p>
          )}
          <Button onClick={addAll} disabled={selectedList.length === 0} className="mt-5 w-full h-12 btn-gold">
            Dodaj do koszyka
          </Button>
        </aside>
      </div>
    </section>
  );
}
