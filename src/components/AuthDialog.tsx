import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function AuthDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
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
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/`, data: { full_name: fullName } },
      });
      setLoading(false);
      if (error) { toast.error(error.message); return; }
      toast.success("Konto utworzone! Możesz się zalogować.");
      setMode("login");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Zalogowano");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{mode === "login" ? "Zaloguj się" : "Utwórz konto"}</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mb-2">
          <button type="button" onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${mode === "login" ? "bg-foreground text-background" : "bg-muted"}`}>
            Logowanie
          </button>
          <button type="button" onClick={() => setMode("signup")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${mode === "signup" ? "bg-foreground text-background" : "bg-muted"}`}>
            Rejestracja
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" && (
            <div>
              <Label htmlFor="ad-name">Imię i nazwisko</Label>
              <Input id="ad-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
          )}
          <div>
            <Label htmlFor="ad-email">E-mail</Label>
            <Input id="ad-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="ad-password">Hasło</Label>
            <Input id="ad-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11 btn-gold">
            {loading ? "Proszę czekać..." : mode === "login" ? "Zaloguj się" : "Utwórz konto"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}