import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";

const schema = z.object({
  customer_name: z.string().trim().min(2, "Podaj imię i nazwisko").max(100),
  phone: z.string().trim().min(6, "Podaj telefon").max(30),
  email: z.string().trim().email("Niepoprawny email").max(255),
  car_make_model: z.string().trim().min(2, "Podaj markę i model").max(100),
  location: z.string().trim().min(2, "Podaj lokalizację").max(200),
  preferred_date: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export function OrderForm({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { items, total, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ customer_name: "", phone: "", email: "", car_make_model: "", location: "", preferred_date: "", notes: "" });
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("");
  const [cars, setCars] = useState<{ id: string; label: string; make_model: string }[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { setLoggedIn(false); return; }
      setLoggedIn(true);
      const [{ data: p }, { data: c }] = await Promise.all([
        supabase.from("profiles").select("full_name,phone,email,default_location").eq("user_id", data.user.id).maybeSingle(),
        supabase.from("car_profiles").select("id,label,make_model").eq("user_id", data.user.id),
      ]);
      if (p) setForm((f) => ({
        ...f,
        customer_name: f.customer_name || p.full_name || "",
        phone: f.phone || p.phone || "",
        email: f.email || p.email || "",
        location: f.location || p.default_location || "",
      }));
      if (c) setCars(c);
    })();
  }, [open]);

  const pickCar = (id: string) => {
    const c = cars.find((x) => x.id === id);
    if (c) set("car_make_model", c.make_model);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    if (items.length === 0) { toast.error("Koszyk jest pusty"); return; }
    setLoading(true);
    const { error } = await supabase.functions.invoke("submit-order", {
      body: { ...parsed.data, items: items.map((i) => ({ name: i.name, price: i.price, type: i.type })), total },
    });
    setLoading(false);
    if (error) { toast.error("Nie udało się wysłać zamówienia"); return; }
    toast.success("Zamówienie wysłane! Skontaktujemy się wkrótce.");
    clear();
    onOpenChange(false);
    setForm({ customer_name: "", phone: "", email: "", car_make_model: "", location: "", preferred_date: "", notes: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-display text-2xl">Formularz zamówienia</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          {!loggedIn && (
            <div className="text-xs text-muted-foreground bg-muted/40 border rounded-md p-2">
              Załóż <a href="/auth" className="underline">konto</a>, aby zbierać punkty (1 pkt = 5 zł) i zapisać profile aut.
            </div>
          )}
          {cars.length > 0 && (
            <div>
              <Label>Wybierz zapisany samochód</Label>
              <select className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                onChange={(e) => pickCar(e.target.value)} defaultValue="">
                <option value="">— wybierz —</option>
                {cars.map((c) => <option key={c.id} value={c.id}>{c.label} — {c.make_model}</option>)}
              </select>
            </div>
          )}
          <div><Label>Imię i nazwisko *</Label><Input value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Telefon *</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} required /></div>
            <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required /></div>
          </div>
          <div><Label>Marka i model *</Label><Input value={form.car_make_model} onChange={(e) => set("car_make_model", e.target.value)} placeholder="np. Audi A4" required /></div>
          <div><Label>Lokalizacja *</Label><Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Miejscowość, kod pocztowy / gmina" required /></div>
          <div>
            <Label>Preferowany termin</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className={cn("flex-1 justify-start text-left font-normal h-10", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: pl }) : <span>Wybierz datę</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => { setDate(d); set("preferred_date", d ? `${format(d, "yyyy-MM-dd")}${time ? " " + time : ""}` : ""); }}
                    disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
                    initialFocus
                    locale={pl}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <Input type="time" value={time} onChange={(e) => { setTime(e.target.value); set("preferred_date", date ? `${format(date, "yyyy-MM-dd")}${e.target.value ? " " + e.target.value : ""}` : ""); }} className="w-32" />
            </div>
          </div>
          <div><Label>Dodatkowe uwagi</Label><Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} /></div>
          <div className="rounded-lg border bg-secondary/40 p-3 text-sm">
            <p className="font-medium mb-1">Podsumowanie ({items.length})</p>
            {items.map((i) => <div key={i.id} className="flex justify-between text-xs"><span>{i.name}</span><span>{Number(i.price).toFixed(0)} zł</span></div>)}
            <div className="flex justify-between font-display text-lg mt-2 pt-2 border-t"><span>Razem</span><span>{total.toFixed(0)} zł</span></div>
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 btn-gold">{loading ? "Wysyłanie..." : "Wyślij zamówienie"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
