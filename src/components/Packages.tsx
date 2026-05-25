import { useEffect, useState } from "react";
import { Check, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { usePromotions } from "@/hooks/usePromotions";

type Pkg = { id: string; slug: string; name: string; description: string | null; features: string[]; price: number; is_featured: boolean; sort_order: number };

export function Packages() {
  const [packages, setPackages] = useState<Pkg[]>([]);
  const { add, setOpen } = useCart();
  const { apply } = usePromotions();
  useEffect(() => {
    supabase.from("packages").select("*").order("sort_order").then(({ data }) => {
      if (data) setPackages(data as unknown as Pkg[]);
    });
  }, []);
  return (
    <section id="oferta" className="py-24 bg-secondary/40">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-[color:var(--gold)] uppercase tracking-[0.25em] text-xs mb-3">Pakiety</p>
          <h2 className="font-display text-4xl md:text-5xl">Wybierz pakiet dla swojego auta</h2>
          <p className="mt-4 text-muted-foreground">Trzy poziomy pielęgnacji — od szybkiego odświeżenia po pełną renowację premium.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((p) => {
            const featured = p.is_featured;
            const { original, final, promo } = apply("package", p.id, Number(p.price));
            return (
              <div key={p.id} className={`relative rounded-2xl border bg-card p-8 flex flex-col ${featured ? "ring-2 ring-[color:var(--gold)] shadow-xl md:scale-[1.03]" : ""}`}>
                {featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-[color:var(--gold)] text-[color:var(--gold-foreground)]">
                    <Crown className="h-3 w-3" /> Najczęściej wybierany
                  </span>
                )}
                {promo && (
                  <span className="absolute -top-3 right-4 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-destructive text-destructive-foreground shadow">
                    -{Number(promo.discount_percent)}% {promo.name}
                  </span>
                )}
                <h3 className="font-display text-2xl">{p.name}</h3>
                {p.description && <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>}
                <div className="mt-6 flex items-baseline gap-1">
                  {promo && (
                    <span className="font-display text-xl line-through text-muted-foreground mr-2">{original.toFixed(0)}</span>
                  )}
                  <span className={`font-display text-5xl font-semibold ${promo ? "text-destructive" : ""}`}>{final.toFixed(0)}</span>
                  <span className="text-muted-foreground">zł</span>
                </div>
                <ul className="mt-6 space-y-2 flex-1">
                  {(p.features || []).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 mt-0.5 text-[color:var(--gold)] shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => {
                    add({ id: `pkg-${p.id}`, type: "package", name: promo ? `${p.name} (-${Number(promo.discount_percent)}%)` : p.name, price: final });
                    toast.success(`Dodano ${p.name} do koszyka`);
                    setOpen(true);
                  }}
                  className={`mt-8 h-12 ${featured ? "btn-gold" : "btn-black"}`}
                >
                  Dodaj do koszyka
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
