import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Promotion = {
  id: string;
  name: string;
  discount_percent: number;
  scope: "all" | "packages" | "services" | "specific";
  target_ids: string[];
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
};

export function usePromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (supabase.from as any)("promotions")
      .select("*")
      .eq("is_active", true)
      .then(({ data }: { data: Promotion[] | null }) => {
        if (!mounted) return;
        const now = Date.now();
        const valid = (data || []).filter((p) => {
          if (p.starts_at && new Date(p.starts_at).getTime() > now) return false;
          if (p.ends_at && new Date(p.ends_at).getTime() < now) return false;
          return true;
        });
        setPromotions(valid);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const findPromo = (type: "package" | "service", id: string): Promotion | null => {
    const matches = promotions.filter((p) => {
      if (p.scope === "all") return true;
      if (p.scope === "packages") return type === "package";
      if (p.scope === "services") return type === "service";
      if (p.scope === "specific") return (p.target_ids || []).includes(id);
      return false;
    });
    if (!matches.length) return null;
    // pick highest discount
    return matches.reduce((a, b) => (Number(b.discount_percent) > Number(a.discount_percent) ? b : a));
  };

  const apply = (type: "package" | "service", id: string, price: number) => {
    const promo = findPromo(type, id);
    if (!promo) return { original: price, final: price, promo: null as Promotion | null };
    const final = Math.round(price * (1 - Number(promo.discount_percent) / 100) * 100) / 100;
    return { original: price, final, promo };
  };

  return { promotions, loading, apply };
}