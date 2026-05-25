import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "Panel — KromDetail" }] }),
});

function AuthPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Zalogowano");
    nav({ to: "/admin" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-sm">
        <h1 className="font-display text-3xl">Panel administratora</h1>
        <p className="text-sm text-muted-foreground mt-1">Zaloguj się, aby zarządzać treścią.</p>
        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Hasło</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
        </div>
        <Button type="submit" disabled={loading} className="mt-6 w-full h-12 btn-gold">
          {loading ? "Logowanie..." : "Zaloguj się"}
        </Button>
        <p className="mt-4 text-xs text-muted-foreground text-center">
          Konto administratora tworzone jest ręcznie.
        </p>
      </form>
    </div>
  );
}