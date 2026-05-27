import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const DEFAULTS = {
  detailing_intro_title: "Czym jest detailing?",
  detailing_intro_body:
    "Detailing to znacznie więcej niż mycie auta. To kompleksowa pielęgnacja lakieru, wnętrza, felg i szyb przy użyciu profesjonalnych preparatów i technik. Efekt? Twój samochód wygląda i pachnie jak nowy — a powłoki ochronne zabezpieczają go na długie miesiące.",
};

export function DetailingIntro() {
  const [title, setTitle] = useState(DEFAULTS.detailing_intro_title);
  const [body, setBody] = useState(DEFAULTS.detailing_intro_body);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_content")
        .select("key,value")
        .in("key", ["detailing_intro_title", "detailing_intro_body"]);
      if (!data) return;
      const map = Object.fromEntries(data.map((r: any) => [r.key, r.value]));
      if (map.detailing_intro_title) setTitle(map.detailing_intro_title);
      if (map.detailing_intro_body) setBody(map.detailing_intro_body);
    })();
  }, []);

  return (
    <section className="border-b bg-secondary/30">
      <div className="container mx-auto px-4 py-10 md:py-12 flex flex-col md:flex-row gap-6 items-start">
        <div className="flex items-center gap-2 text-[color:var(--gold)] shrink-0">
          <Sparkles className="h-5 w-5" />
          <span className="uppercase tracking-[0.25em] text-xs font-medium">Info</span>
        </div>
        <div>
          <h2 className="font-display text-2xl md:text-3xl">{title}</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed max-w-3xl">{body}</p>
        </div>
      </div>
    </section>
  );
}