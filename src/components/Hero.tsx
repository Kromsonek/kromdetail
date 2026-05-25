import heroImg from "@/assets/hero-car.jpg";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative h-[88vh] min-h-[560px] w-full">
        <img src={heroImg} alt="Czarne auto premium po detailingu" className="absolute inset-0 h-full w-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/85" />
        <div className="relative z-10 container mx-auto h-full flex flex-col justify-center px-4">
          <p className="text-[color:var(--gold)] uppercase tracking-[0.25em] text-xs mb-4">KromDetail • Premium Mobile Detailing</p>
          <h1 className="font-display text-5xl md:text-7xl font-semibold text-white max-w-4xl leading-[1.05]">
            Przywracamy Autu <span className="italic text-[color:var(--gold)]">Godność</span>
          </h1>
          <p className="mt-6 text-base md:text-lg text-white/80 max-w-2xl">
            Premium Mobilny Detailing • Przyjeżdżamy na wieś • Najwyższa jakość
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="btn-gold h-12 px-7 text-sm font-semibold tracking-wide">
              <a href="#oferta">Zobacz Ofertę</a>
            </Button>
            <Button asChild variant="outline" className="h-12 px-7 text-sm font-semibold tracking-wide bg-transparent text-white border-white/40 hover:bg-white hover:text-black">
              <a href="#custom">Zarezerwuj Termin</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
