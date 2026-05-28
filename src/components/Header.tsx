import { Link, useNavigate } from "@tanstack/react-router";
import { Moon, ShoppingCart, Sun, User } from "lucide-react";
import { useEffect, useState } from "react";
import logo from "@/assets/logo.jpeg";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeProvider";
import { useCart } from "@/contexts/CartContext";
import { AuthDialog } from "./AuthDialog";
import { supabase } from "@/integrations/supabase/client";

export function Header() {
  const { theme, toggle } = useTheme();
  const { items, setOpen } = useCart();
  const [authOpen, setAuthOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const nav = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setLoggedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur bg-background/80 border-b">
      <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="KromDetail logo" className="h-10 w-auto dark:invert" width={80} height={40} />
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#oferta" className="hover:text-[color:var(--gold)] transition-colors">Oferta</a>
          <a href="#custom" className="hover:text-[color:var(--gold)] transition-colors">Custom</a>
          <a href="#proces" className="hover:text-[color:var(--gold)] transition-colors">Proces</a>
          <a href="#galeria" className="hover:text-[color:var(--gold)] transition-colors">Galeria</a>
          <a href="#kontakt" className="hover:text-[color:var(--gold)] transition-colors">Kontakt</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Konto"
            onClick={() => { if (loggedIn) nav({ to: "/account" }); else setAuthOpen(true); }}>
            <User className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Koszyk" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 text-[10px] font-semibold rounded-full h-5 min-w-5 px-1 flex items-center justify-center bg-[color:var(--gold)] text-[color:var(--gold-foreground)]">
                {items.length}
              </span>
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Zmień motyw">
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  );
}
