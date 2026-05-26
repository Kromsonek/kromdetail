import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { LogOut, Trash2, Award, Car, User as UserIcon, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/account")({
  component: AccountPage,
  head: () => ({ meta: [{ title: "Moje konto — KromDetail" }] }),
});

type Profile = {
  full_name: string | null;
  phone: string | null;
  email: string | null;
  default_location: string | null;
  points: number;
};
type Car = { id: string; label: string; make_model: string; plate: string | null; notes: string | null };
type Reward = { id: string; name: string; description: string | null; points_cost: number; image_url: string | null };
type Txn = { id: string; delta: number; reason: string; created_at: string };

function AccountPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [txns, setTxns] = useState<Txn[]>([]);

  const [carForm, setCarForm] = useState({ label: "", make_model: "", plate: "", notes: "" });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { nav({ to: "/auth" }); return; }
      setUserId(data.user.id);
      await loadAll(data.user.id);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAll = async (uid: string) => {
    const [p, c, r, t, role] = await Promise.all([
      supabase.from("profiles").select("full_name,phone,email,default_location,points").eq("user_id", uid).maybeSingle(),
      supabase.from("car_profiles").select("*").eq("user_id", uid).order("created_at"),
      supabase.from("rewards").select("*").eq("is_active", true).order("points_cost"),
      supabase.from("point_transactions").select("id,delta,reason,created_at").eq("user_id", uid).order("created_at", { ascending: false }).limit(20),
      supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle(),
    ]);
    if (p.data) setProfile(p.data as Profile);
    if (c.data) setCars(c.data as Car[]);
    if (r.data) setRewards(r.data as Reward[]);
    if (t.data) setTxns(t.data as Txn[]);
    setIsAdmin(!!role.data);
  };

  const saveProfile = async () => {
    if (!profile || !userId) return;
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name, phone: profile.phone, default_location: profile.default_location,
    }).eq("user_id", userId);
    if (error) return toast.error(error.message);
    toast.success("Zapisano profil");
  };

  const addCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    if (!carForm.label.trim() || !carForm.make_model.trim()) return toast.error("Etykieta i model wymagane");
    const { error } = await supabase.from("car_profiles").insert({ ...carForm, user_id: userId });
    if (error) return toast.error(error.message);
    toast.success("Dodano samochód");
    setCarForm({ label: "", make_model: "", plate: "", notes: "" });
    loadAll(userId);
  };

  const deleteCar = async (id: string) => {
    if (!confirm("Usunąć ten profil samochodu?")) return;
    await supabase.from("car_profiles").delete().eq("id", id);
    if (userId) loadAll(userId);
  };

  const redeem = async (r: Reward) => {
    if (!profile || !userId) return;
    if (profile.points < r.points_cost) return toast.error("Za mało punktów");
    if (!confirm(`Wymienić ${r.points_cost} pkt na: ${r.name}?`)) return;
    const { error: pe } = await supabase.from("profiles").update({ points: profile.points - r.points_cost }).eq("user_id", userId);
    if (pe) return toast.error(pe.message);
    await supabase.from("point_transactions").insert({ user_id: userId, delta: -r.points_cost, reason: `Nagroda: ${r.name}`, reward_id: r.id });
    toast.success("Skontaktujemy się w sprawie nagrody!");
    loadAll(userId);
  };

  const logout = async () => { await supabase.auth.signOut(); nav({ to: "/" }); };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Ładowanie...</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl">KromDetail</Link>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="outline" size="sm"><ShieldCheck className="h-4 w-4 mr-1" />Admin</Button>
              </Link>
            )}
            <Button variant="ghost" size="sm" onClick={logout}><LogOut className="h-4 w-4 mr-1" />Wyloguj</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-4xl space-y-10">
        {/* Karnet lojalnościowy */}
        <section className="rounded-2xl border bg-gradient-to-br from-[color:var(--gold)]/20 to-card p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                <Award className="h-4 w-4" />Karnet lojalnościowy <span className="text-[color:var(--gold)] font-semibold">NOWOŚĆ!</span>
              </div>
              <p className="font-display text-4xl mt-1">{profile?.points ?? 0} pkt</p>
              <p className="text-xs text-muted-foreground mt-1">1 pkt za każde 10 zł wydane na zamówienie.</p>
            </div>
          </div>

          {rewards.length > 0 && (
            <>
              <h3 className="font-semibold mt-6 mb-3">Nagrody do wymiany</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {rewards.map((r) => (
                  <div key={r.id} className="rounded-xl border bg-card p-4 flex gap-3">
                    {r.image_url && <img src={r.image_url} alt={r.name} className="h-16 w-16 object-cover rounded" />}
                    <div className="flex-1">
                      <p className="font-semibold">{r.name}</p>
                      {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-[color:var(--gold)]">{r.points_cost} pkt</span>
                        <Button size="sm" onClick={() => redeem(r)} disabled={(profile?.points ?? 0) < r.points_cost}>Wymień</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {txns.length > 0 && (
            <details className="mt-6">
              <summary className="cursor-pointer text-sm text-muted-foreground">Historia punktów</summary>
              <ul className="mt-3 space-y-1 text-sm">
                {txns.map((t) => (
                  <li key={t.id} className="flex justify-between border-b py-1">
                    <span>{t.reason}</span>
                    <span className={t.delta > 0 ? "text-green-600" : "text-destructive"}>{t.delta > 0 ? "+" : ""}{t.delta} pkt</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>

        {/* Profil */}
        <section className="rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserIcon className="h-5 w-5" /><h2 className="font-display text-2xl">Mój profil</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Imię i nazwisko</Label>
              <Input value={profile?.full_name ?? ""} onChange={(e) => setProfile((p) => p && { ...p, full_name: e.target.value })} /></div>
            <div><Label>Telefon</Label>
              <Input value={profile?.phone ?? ""} onChange={(e) => setProfile((p) => p && { ...p, phone: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>E-mail</Label>
              <Input value={profile?.email ?? ""} disabled /></div>
            <div className="sm:col-span-2"><Label>Domyślna lokalizacja</Label>
              <Input value={profile?.default_location ?? ""} placeholder="np. Lubiszyn, 66-433"
                onChange={(e) => setProfile((p) => p && { ...p, default_location: e.target.value })} /></div>
          </div>
          <Button onClick={saveProfile} className="mt-4 btn-gold">Zapisz profil</Button>
        </section>

        {/* Samochody */}
        <section className="rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Car className="h-5 w-5" /><h2 className="font-display text-2xl">Moje samochody</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Zapisz auta, by nie wpisywać ich za każdym razem przy zamówieniu.</p>

          <div className="space-y-2 mb-6">
            {cars.length === 0 && <p className="text-sm text-muted-foreground">Brak zapisanych aut.</p>}
            {cars.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-semibold">{c.label} <span className="text-muted-foreground font-normal">— {c.make_model}</span></p>
                  {c.plate && <p className="text-xs text-muted-foreground">{c.plate}</p>}
                  {c.notes && <p className="text-xs text-muted-foreground">{c.notes}</p>}
                </div>
                <Button size="icon" variant="ghost" onClick={() => deleteCar(c.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          <form onSubmit={addCar} className="grid sm:grid-cols-2 gap-3 border-t pt-4">
            <div><Label>Etykieta *</Label>
              <Input value={carForm.label} onChange={(e) => setCarForm({ ...carForm, label: e.target.value })} placeholder="np. Auto codzienne" /></div>
            <div><Label>Marka i model *</Label>
              <Input value={carForm.make_model} onChange={(e) => setCarForm({ ...carForm, make_model: e.target.value })} placeholder="np. Audi A4" /></div>
            <div><Label>Numer rejestracyjny</Label>
              <Input value={carForm.plate} onChange={(e) => setCarForm({ ...carForm, plate: e.target.value })} /></div>
            <div><Label>Notatki</Label>
              <Textarea value={carForm.notes} onChange={(e) => setCarForm({ ...carForm, notes: e.target.value })} rows={1} /></div>
            <Button type="submit" className="sm:col-span-2 btn-gold">Dodaj samochód</Button>
          </form>
        </section>
      </main>
    </div>
  );
}