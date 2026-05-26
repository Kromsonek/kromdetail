import { Car, Droplets, Sparkles, ShieldCheck, MapPin, Phone, Mail, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

export function Process() {
  const steps = [
    { i: Car, t: "Dojazd", d: "Przyjeżdżamy do Ciebie z pełnym sprzętem" },
    { i: Droplets, t: "Mycie wstępne", d: "Aktywna piana, dekontaminacja" },
    { i: Sparkles, t: "Detailing", d: "Wnętrze, lakier, felgi — w detalach" },
    { i: ShieldCheck, t: "Ochrona", d: "Wosk, sealant, finishing" },
  ];
  return (
    <section id="proces" className="py-24 bg-secondary/40">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-[color:var(--gold)] uppercase tracking-[0.25em] text-xs mb-3">Proces</p>
          <h2 className="font-display text-4xl md:text-5xl">Jak pracujemy</h2>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {steps.map(({ i: Icon, t, d }, idx) => (
            <div key={t} className="p-6 rounded-xl border bg-card">
              <div className="flex items-center justify-between"><span className="font-display text-3xl text-[color:var(--gold)]">{`0${idx + 1}`}</span><Icon className="h-6 w-6 opacity-60" /></div>
              <h3 className="mt-4 font-semibold text-lg">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Gallery() {
  return (
    <section id="galeria" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-[color:var(--gold)] uppercase tracking-[0.25em] text-xs mb-3">Galeria</p>
          <h2 className="font-display text-4xl md:text-5xl">Przed / Po</h2>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-xl border bg-secondary flex items-center justify-center text-muted-foreground text-sm">Zdjęcie {i + 1}</div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Reviews() {
  const [reviews, setReviews] = useState<Array<{ id: string; author_name: string; rating: number; content: string }>>([]);
  const [user, setUser] = useState<{ id: string; email?: string | null } | null>(null);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [authorName, setAuthorName] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("reviews" as any).select("id,author_name,rating,content").order("created_at", { ascending: false }).limit(12);
    if (data) setReviews(data as any);
  };

  useEffect(() => {
    load();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ? { id: data.user.id, email: data.user.email } : null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setUser(s?.user ? { id: s.user.id, email: s.user.email } : null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (content.trim().length < 5) return toast.error("Opinia musi mieć co najmniej 5 znaków");
    if (authorName.trim().length < 2) return toast.error("Podaj imię");
    setLoading(true);
    const { error } = await (supabase.from as any)("reviews").insert({
      user_id: user.id,
      author_name: authorName.trim().slice(0, 60),
      rating,
      content: content.trim().slice(0, 500),
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Dziękujemy za opinię!");
    setContent("");
    setRating(5);
    load();
  };

  return (
    <section className="py-24 bg-secondary/40">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-[color:var(--gold)] uppercase tracking-[0.25em] text-xs mb-3">Opinie</p>
          <h2 className="font-display text-4xl md:text-5xl">Co mówią klienci</h2>
        </div>
        {reviews.length === 0 ? (
          <p className="text-center text-muted-foreground">Brak opinii. Bądź pierwszy!</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {reviews.map((r) => (
              <div key={r.id} className="p-6 rounded-xl border bg-card">
                <div className="flex gap-1 text-[color:var(--gold)]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-current" : "opacity-30"}`} />
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed">{r.content}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider opacity-70">{r.author_name}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 max-w-xl mx-auto">
          {user ? (
            <form onSubmit={submit} className="rounded-2xl border bg-card p-6 space-y-3">
              <h3 className="font-semibold">Dodaj swoją opinię</h3>
              <div>
                <Label>Imię</Label>
                <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} maxLength={60} required />
              </div>
              <div>
                <Label>Ocena</Label>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} gwiazdek`}>
                      <Star className={`h-6 w-6 ${n <= rating ? "fill-current text-[color:var(--gold)]" : "opacity-30"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Opinia</Label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} maxLength={500} required />
              </div>
              <Button type="submit" disabled={loading} className="btn-gold w-full h-11">{loading ? "Wysyłanie..." : "Opublikuj opinię"}</Button>
            </form>
          ) : (
            <div className="rounded-2xl border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">Aby dodać opinię, musisz mieć konto.</p>
              <Link to="/auth" className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm btn-gold h-10">Zaloguj się / Zarejestruj</Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section id="kontakt" className="py-24">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-10">
        <div>
          <p className="text-[color:var(--gold)] uppercase tracking-[0.25em] text-xs mb-3">Kontakt</p>
          <h2 className="font-display text-4xl md:text-5xl">Skontaktuj się</h2>
          <p className="mt-4 text-muted-foreground">Zadzwoń lub napisz — odpowiadamy w ciągu kilku godzin.</p>
          <ul className="mt-8 space-y-3">
            <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-[color:var(--gold)]" /> <a href="tel:+48798666824" className="hover:text-[color:var(--gold)]">+48 798 666 824</a></li>
            <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-[color:var(--gold)]" /> <a href="mailto:KromBiznes@gmail.com" className="hover:text-[color:var(--gold)]">KromBiznes@gmail.com</a></li>
            <li className="flex items-start gap-3"><MapPin className="h-4 w-4 mt-1 text-[color:var(--gold)]" /> <span>Dojazd: Lubiszyn, Brzeźno (66-433) i okolice</span></li>
          </ul>
        </div>
        <div className="aspect-video rounded-xl overflow-hidden border">
          <iframe title="mapa" src="https://www.openstreetmap.org/export/embed.html?bbox=14%2C49%2C24%2C55&amp;layer=mapnik" className="w-full h-full" />
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="py-10 border-t">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} KromDetail. Wszystkie prawa zastrzeżone.</p>
        <a href="/auth" className="hover:text-foreground">Panel</a>
      </div>
    </footer>
  );
}
