import { Sparkles, MapPin, ShieldCheck, Clock } from "lucide-react";

export function About() {
  const items = [
    { icon: MapPin, t: "Dojazd na wieś", d: "Pracujemy w Twoim podjeździe – bez stresu i dojazdów" },
    { icon: Sparkles, t: "Premium chemia", d: "Profesjonalne preparaty detailingowe i mikrofibry" },
    { icon: ShieldCheck, t: "Pełna ochrona", d: "Wosk, sealant i ozonowanie chronią lakier i wnętrze" },
    { icon: Clock, t: "Zawsze na czas", d: "Realizacja w ustalonym terminie, dyskretnie i sumiennie" },
  ];
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-start">
        <div>
          <p className="text-[color:var(--gold)] uppercase tracking-[0.25em] text-xs mb-3">O KromDetail</p>
          <h2 className="font-display text-4xl md:text-5xl">Detailing premium <em className="text-[color:var(--gold)] not-italic">na Twojej posesji.</em></h2>
          <p className="mt-6 text-muted-foreground text-lg leading-relaxed">
            KromDetail to mobilny detailing premium prosto na Twojej posesji. Specjalizuję się w usuwaniu
            zabrudzeń po polnych drogach, błocie i codziennym użytkowaniu. Wracam aucie blask, świeżość
            i charakter — z dbałością o każdy detal.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map(({ icon: Icon, t, d }) => (
            <div key={t} className="p-6 rounded-xl border bg-card">
              <Icon className="h-6 w-6 text-[color:var(--gold)]" />
              <h3 className="mt-3 font-semibold text-lg">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
