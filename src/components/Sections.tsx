import { Car, Droplets, Sparkles, ShieldCheck, MapPin, Phone, Mail, Star } from "lucide-react";

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
  const reviews = [
    { n: "Tomasz K.", t: "Auto wygląda jak nowe. Pełen profesjonalizm i dojazd na miejsce — polecam!" },
    { n: "Anna W.", t: "Świetnie wyczyszczone wnętrze, zniknął zapach psa. Bardzo dziękuję!" },
    { n: "Marek P.", t: "Black Edition to coś najlepszego dla mojego BMW. Klasa premium." },
  ];
  return (
    <section className="py-24 bg-secondary/40">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-[color:var(--gold)] uppercase tracking-[0.25em] text-xs mb-3">Opinie</p>
          <h2 className="font-display text-4xl md:text-5xl">Co mówią klienci</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {reviews.map((r) => (
            <div key={r.n} className="p-6 rounded-xl border bg-card">
              <div className="flex gap-1 text-[color:var(--gold)]">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
              <p className="mt-3 text-sm leading-relaxed">{r.t}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider opacity-70">{r.n}</p>
            </div>
          ))}
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
            <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-[color:var(--gold)]" /> +48 000 000 000</li>
            <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-[color:var(--gold)]" /> KromBiznes@gmail.com</li>
            <li className="flex items-center gap-3"><MapPin className="h-4 w-4 text-[color:var(--gold)]" /> Dojazd: cały region</li>
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
