import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Packages } from "@/components/Packages";
import { CustomServices } from "@/components/CustomServices";
import { Process, Gallery, Reviews, Contact, Footer } from "@/components/Sections";
import { CartDrawer } from "@/components/CartDrawer";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "KromDetail — Premium Mobilny Detailing" },
      { name: "description", content: "KromDetail — premium mobilny detailing samochodów. Przyjeżdżamy do Ciebie, na wieś, z pełnym sprzętem. Pakiety od 249 zł." },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <About />
        <Packages />
        <CustomServices />
        <Process />
        <Gallery />
        <Reviews />
        <Contact />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
