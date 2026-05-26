import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "Konto — KromDetail" }] }),
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/account`,
          data: { full_name: fullName },
        },
      });
      setLoading(false);
      if (error) { toast.error(error.message); return; }
      toast.success("Konto utworzone! Sprawdź mail lub zaloguj się.");
      setMode("login");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Zalogowano");
    nav({ to: "/account" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-sm">
        <div className="flex gap-2 mb-6">
          <button type="button" onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${mode === "login" ? "bg-foreground text-background" : "bg-muted"}`}>
            Logowanie
          </button>
          <button type="button" onClick={() => setMode("signup")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${mode === "signup" ? "bg-foreground text-background" : "bg-muted"}`}>
            Rejestracja
          </button>
        </div>
        <h1 className="font-display text-2xl">{mode === "login" ? "Zaloguj się" : "Utwórz konto"}</h1>
        <p className="text-sm text-muted-foreground mt-1">Zbieraj punkty (1 pkt = 10 zł) i zapisz profile aut.</p>
        <div className="mt-6 space-y-4">
          {mode === "signup" && (
            <div>
              <Label htmlFor="name">Imię i nazwisko</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
          )}
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Hasło</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
        </div>
        <Button type="submit" disabled={loading} className="mt-6 w-full h-12 btn-gold">
          {loading ? "Proszę czekać..." : mode === "login" ? "Zaloguj się" : "Utwórz konto"}
        </Button>
        <p className="mt-4 text-xs text-muted-foreground text-center">
          Pierwsze utworzone konto automatycznie zostaje administratorem.
        </p>
      </form>
    </div>
  );
}