import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, LogOut, Tag, Award, ClipboardCheck, Check, X, Pencil, Package, Home, Wrench } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — KromDetail" }] }),
});

type Promotion = {
  id: string;
  name: string;
  discount_percent: number;
  scope: "all" | "packages" | "services" | "specific";
  target_ids: string[];
  is_active: boolean;
};

type Pkg = { id: string; name: string };
type PkgFull = { id: string; name: string; description: string | null; price: number; features: string[]; is_featured: boolean; sort_order: number };
type Svc = { id: string; name: string };
type SvcFull = { id: string; name: string; description: string | null; price: number; sort_order: number };
type Reward = { id: string; name: string; description: string | null; points_cost: number; image_url: string | null; is_active: boolean };
type Order = {
  id: string;
  customer_name: string;
  phone: string;
  email: string;
  car_make_model: string;
  location: string;
  preferred_date: string | null;
  notes: string | null;
  items: any;
  total: number;
  status: string;
  created_at: string;
};

function AdminPage() {
  const nav = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [packagesFull, setPackagesFull] = useState<PkgFull[]>([]);
  const [editPkg, setEditPkg] = useState<PkgFull | null>(null);
  const [services, setServices] = useState<Svc[]>([]);
  const [servicesFull, setServicesFull] = useState<SvcFull[]>([]);
  const [editSvc, setEditSvc] = useState<SvcFull | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editReward, setEditReward] = useState<Reward | null>(null);
  const [introTitle, setIntroTitle] = useState("");
  const [introBody, setIntroBody] = useState("");
  const [savingIntro, setSavingIntro] = useState(false);
  const [rwName, setRwName] = useState("");
  const [rwDesc, setRwDesc] = useState("");
  const [rwCost, setRwCost] = useState<number>(50);
  const [rwImage, setRwImage] = useState("");

  const [name, setName] = useState("");
  const [percent, setPercent] = useState<number>(10);
  const [scope, setScope] = useState<Promotion["scope"]>("all");
  const [targetIds, setTargetIds] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        nav({ to: "/auth" });
        return;
      }
      setUserEmail(data.user.email ?? null);
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();
      const ok = !!roleData;
      setIsAdmin(ok);
      setChecking(false);
      if (ok) await loadAll();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAll = async () => {
    const [pkgs, pkgsFull, svcs, svcsFull, promos, rws, ords] = await Promise.all([
      supabase.from("packages").select("id,name").order("sort_order"),
      supabase.from("packages").select("*").order("sort_order"),
      supabase.from("services").select("id,name").order("sort_order"),
      supabase.from("services").select("*").order("sort_order"),
      (supabase.from as any)("promotions").select("*").order("created_at", { ascending: false }),
      supabase.from("rewards").select("*").order("points_cost", { ascending: true }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
    ]);
    const { data: contentRows } = await supabase
      .from("site_content")
      .select("key,value")
      .in("key", ["detailing_intro_title", "detailing_intro_body"]);
    if (contentRows) {
      const map = Object.fromEntries(contentRows.map((r: any) => [r.key, r.value]));
      setIntroTitle(map.detailing_intro_title || "");
      setIntroBody(map.detailing_intro_body || "");
    }
    if (pkgs.data) setPackages(pkgs.data as Pkg[]);
    if (pkgsFull.data) setPackagesFull(pkgsFull.data as unknown as PkgFull[]);
    if (svcs.data) setServices(svcs.data as Svc[]);
    if (svcsFull.data) setServicesFull(svcsFull.data as unknown as SvcFull[]);
    if (promos.data) setPromotions(promos.data as Promotion[]);
    if (rws.data) setRewards(rws.data as Reward[]);
    if (ords.data) setOrders(ords.data as Order[]);
  };

  const targetOptions: { id: string; label: string }[] =
    scope === "specific"
      ? [
          ...packages.map((p) => ({ id: p.id, label: `Pakiet: ${p.name}` })),
          ...services.map((s) => ({ id: s.id, label: `Usługa: ${s.name}` })),
        ]
      : [];

  const resetForm = () => {
    setName("");
    setPercent(10);
    setScope("all");
    setTargetIds([]);
    setIsActive(true);
  };

  const saveIntro = async () => {
    setSavingIntro(true);
    const rows = [
      { key: "detailing_intro_title", value: introTitle },
      { key: "detailing_intro_body", value: introBody },
    ];
    const { error } = await (supabase.from as any)("site_content").upsert(rows, { onConflict: "key" });
    setSavingIntro(false);
    if (error) return toast.error(error.message);
    toast.success("Treści zapisane");
  };

  const createPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Podaj powód promocji");
    if (percent <= 0 || percent > 100) return toast.error("Procent musi być w zakresie 1–100");
    if (scope === "specific" && targetIds.length === 0)
      return toast.error("Wybierz przynajmniej jeden produkt");
    setSaving(true);
    const { error } = await (supabase.from as any)("promotions").insert({
      name: name.trim(),
      discount_percent: percent,
      scope,
      target_ids: scope === "specific" ? targetIds : [],
      is_active: isActive,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Promocja dodana");
    resetForm();
    loadAll();
  };

  const toggleActive = async (p: Promotion) => {
    const { error } = await (supabase.from as any)("promotions")
      .update({ is_active: !p.is_active })
      .eq("id", p.id);
    if (error) return toast.error(error.message);
    loadAll();
  };

  const deletePromo = async (id: string) => {
    if (!confirm("Usunąć tę promocję?")) return;
    const { error } = await (supabase.from as any)("promotions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Usunięto");
    loadAll();
  };

  const addReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rwName.trim() || rwCost <= 0) return toast.error("Podaj nazwę i koszt punktów");
    const { error } = await supabase.from("rewards").insert({
      name: rwName.trim(), description: rwDesc.trim() || null,
      points_cost: rwCost, image_url: rwImage.trim() || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Nagroda dodana");
    setRwName(""); setRwDesc(""); setRwCost(50); setRwImage("");
    loadAll();
  };

  const toggleReward = async (r: Reward) => {
    await supabase.from("rewards").update({ is_active: !r.is_active }).eq("id", r.id);
    loadAll();
  };

  const deleteReward = async (id: string) => {
    if (!confirm("Usunąć nagrodę?")) return;
    await supabase.from("rewards").delete().eq("id", id);
    loadAll();
  };

  const saveRewardEdit = async () => {
    if (!editReward) return;
    const { error } = await supabase.from("rewards").update({
      name: editReward.name,
      description: editReward.description,
      points_cost: editReward.points_cost,
      image_url: editReward.image_url,
    }).eq("id", editReward.id);
    if (error) return toast.error(error.message);
    toast.success("Zaktualizowano nagrodę");
    setEditReward(null);
    loadAll();
  };

  const savePkgEdit = async () => {
    if (!editPkg) return;
    const { error } = await supabase.from("packages").update({
      name: editPkg.name,
      description: editPkg.description,
      price: editPkg.price,
      features: editPkg.features as any,
      is_featured: editPkg.is_featured,
      sort_order: editPkg.sort_order,
    }).eq("id", editPkg.id);
    if (error) return toast.error(error.message);
    toast.success("Pakiet zaktualizowany");
    setEditPkg(null);
    loadAll();
  };

  const saveSvcEdit = async () => {
    if (!editSvc) return;
    const { error } = await supabase.from("services").update({
      name: editSvc.name,
      description: editSvc.description,
      price: editSvc.price,
      sort_order: editSvc.sort_order,
    }).eq("id", editSvc.id);
    if (error) return toast.error(error.message);
    toast.success("Usługa zaktualizowana");
    setEditSvc(null);
    loadAll();
  };

  const deleteSvc = async (id: string) => {
    if (!confirm("Usunąć tę usługę?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Usługa usunięta");
    loadAll();
  };

  const setOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(status === "approved" ? "Zatwierdzono — punkty przyznane" : "Status zaktualizowany");
    loadAll();
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Usunąć to zamówienie?")) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Zamówienie usunięte");
    loadAll();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    nav({ to: "/auth" });
  };

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Sprawdzanie uprawnień...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-3xl">Brak dostępu</h1>
          <p className="mt-2 text-muted-foreground">Konto {userEmail} nie ma roli administratora.</p>
          <div className="mt-4 flex justify-center gap-2">
            <Button onClick={logout} variant="outline">Wyloguj</Button>
            <Link to="/" className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm">Powrót</Link>
          </div>
        </div>
      </div>
    );
  }

  const scopeLabel = (s: Promotion["scope"]) =>
    s === "all" ? "Wszystkie produkty"
    : s === "packages" ? "Wszystkie pakiety"
    : s === "services" ? "Wszystkie usługi"
    : "Wybrane produkty";

  const targetName = (id: string) => {
    const p = packages.find((x) => x.id === id);
    if (p) return `Pakiet: ${p.name}`;
    const s = services.find((x) => x.id === id);
    if (s) return `Usługa: ${s.name}`;
    return id;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-display text-2xl">KromDetail · Admin</span>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground hidden sm:inline mr-2">{userEmail}</span>
            <Link to="/" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 h-9 text-sm font-medium hover:bg-accent">
              <Home className="h-4 w-4 mr-1" /> Strona główna
            </Link>
            <Button variant="outline" size="sm" onClick={logout} className="h-9">
              <LogOut className="h-4 w-4 mr-1" /> Wyloguj
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="flex items-center gap-2 mb-6">
          <ClipboardCheck className="h-5 w-5 text-[color:var(--gold)]" />
          <h2 className="font-display text-3xl">Zamówienia do zatwierdzenia</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Klient otrzyma punkty lojalnościowe (1 pkt = 5 zł) <strong>dopiero po zatwierdzeniu</strong> zamówienia.
        </p>
        <div className="space-y-3 mb-12">
          {orders.length === 0 && (
            <p className="text-sm text-muted-foreground">Brak zamówień.</p>
          )}
          {orders.map((o) => (
            <div key={o.id} className="rounded-xl border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-[240px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{o.customer_name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      o.status === "approved" ? "bg-green-600 text-white" :
                      o.status === "rejected" ? "bg-destructive text-destructive-foreground" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {o.status === "approved" ? "Zatwierdzone" : o.status === "rejected" ? "Odrzucone" : "Nowe"}
                    </span>
                    <span className="text-[color:var(--gold)] font-bold">{Number(o.total).toFixed(0)} zł</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {o.phone} · {o.email} · {o.car_make_model} · {o.location}
                    {o.preferred_date && <> · termin: {o.preferred_date}</>}
                  </p>
                  {Array.isArray(o.items) && (
                    <ul className="text-xs mt-2 list-disc pl-4">
                      {o.items.map((it: any, idx: number) => (
                        <li key={idx}>{it.name} — {Number(it.price).toFixed(0)} zł</li>
                      ))}
                    </ul>
                  )}
                  {o.notes && <p className="text-xs italic mt-1">„{o.notes}"</p>}
                </div>
                <div className="flex items-center gap-2">
                  {o.status !== "approved" && (
                    <Button size="sm" onClick={() => setOrderStatus(o.id, "approved")} className="bg-green-600 hover:bg-green-700 text-white">
                      <Check className="h-4 w-4 mr-1" />Zatwierdź
                    </Button>
                  )}
                  {o.status === "new" && (
                    <Button size="sm" variant="outline" onClick={() => setOrderStatus(o.id, "rejected")}>
                      <X className="h-4 w-4 mr-1" />Odrzuć
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => deleteOrder(o.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Tag className="h-5 w-5 text-[color:var(--gold)]" />
          <h2 className="font-display text-3xl">Promocje</h2>
        </div>

        <form onSubmit={createPromo} className="rounded-2xl border bg-card p-6 mb-8 space-y-4">
          <h3 className="font-semibold">Dodaj nową promocję</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="promo-name">Powód / nazwa promocji</Label>
              <Input id="promo-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="np. Wiosenna wyprzedaż" required maxLength={100} />
            </div>
            <div>
              <Label htmlFor="promo-percent">Procent zniżki (%)</Label>
              <Input id="promo-percent" type="number" min={1} max={100} value={percent}
                onChange={(e) => setPercent(Number(e.target.value))} required />
            </div>
            <div>
              <Label>Zakres</Label>
              <Select value={scope} onValueChange={(v) => { setScope(v as Promotion["scope"]); setTargetIds([]); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie produkty</SelectItem>
                  <SelectItem value="packages">Wszystkie pakiety</SelectItem>
                  <SelectItem value="services">Wszystkie usługi</SelectItem>
                  <SelectItem value="specific">Wybrane produkty</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Checkbox id="promo-active" checked={isActive} onCheckedChange={(v) => setIsActive(!!v)} />
              <Label htmlFor="promo-active" className="cursor-pointer">Promocja aktywna</Label>
            </div>
          </div>

          {scope === "specific" && (
            <div>
              <Label>Wybierz produkty</Label>
              <div className="mt-2 grid sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-3 rounded-lg border bg-background">
                {targetOptions.map((opt) => {
                  const checked = targetIds.includes(opt.id);
                  return (
                    <label key={opt.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={checked} onCheckedChange={(v) => {
                        setTargetIds((prev) => v ? [...prev, opt.id] : prev.filter((x) => x !== opt.id));
                      }} />
                      <span>{opt.label}</span>
                    </label>
                  );
                })}
                {targetOptions.length === 0 && <p className="text-sm text-muted-foreground">Brak produktów</p>}
              </div>
            </div>
          )}

          <Button type="submit" disabled={saving} className="btn-gold h-11">
            {saving ? "Zapisywanie..." : "Dodaj promocję"}
          </Button>
        </form>

        <div className="space-y-3">
          <h3 className="font-semibold">Aktualne promocje ({promotions.length})</h3>
          {promotions.length === 0 && (
            <p className="text-sm text-muted-foreground">Brak promocji. Dodaj pierwszą powyżej.</p>
          )}
          {promotions.map((p) => (
            <div key={p.id} className="rounded-xl border bg-card p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{p.name}</span>
                  <span className="inline-flex items-center text-xs font-bold px-2 py-0.5 rounded bg-destructive text-destructive-foreground">
                    -{Number(p.discount_percent)}%
                  </span>
                  {!p.is_active && (
                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">Nieaktywna</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {scopeLabel(p.scope)}
                  {p.scope === "specific" && p.target_ids?.length > 0 && (
                    <> — {p.target_ids.map(targetName).join(", ")}</>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => toggleActive(p)}>
                  {p.is_active ? "Wyłącz" : "Włącz"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deletePromo(p.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-12 mb-6">
          <Package className="h-5 w-5 text-[color:var(--gold)]" />
          <h2 className="font-display text-3xl">Pakiety</h2>
        </div>
        <div className="space-y-3 mb-12">
          {packagesFull.length === 0 && <p className="text-sm text-muted-foreground">Brak pakietów.</p>}
          {packagesFull.map((p) => (
            <div key={p.id} className="rounded-xl border bg-card p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1 min-w-[200px]">
                <p className="font-semibold">
                  {p.name}
                  <span className="text-[color:var(--gold)] font-bold ml-2">{Number(p.price).toFixed(0)} zł</span>
                  {p.is_featured && <span className="ml-2 text-xs px-2 py-0.5 rounded bg-[color:var(--gold)] text-[color:var(--gold-foreground)]">Polecany</span>}
                </p>
                {p.description && <p className="text-xs text-muted-foreground mt-1">{p.description}</p>}
                {p.features?.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">{p.features.length} cech</p>
                )}
              </div>
              <Button size="sm" variant="outline" onClick={() => setEditPkg(p)}>
                <Pencil className="h-4 w-4 mr-1" />Edytuj
              </Button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-12 mb-6">
          <Wrench className="h-5 w-5 text-[color:var(--gold)]" />
          <h2 className="font-display text-3xl">Usługi (Krom Custom)</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Pojedyncze usługi, z których klient może składać swój własny pakiet.
        </p>
        <div className="space-y-3 mb-12">
          {servicesFull.length === 0 && <p className="text-sm text-muted-foreground">Brak usług.</p>}
          {servicesFull.map((s) => (
            <div key={s.id} className="rounded-xl border bg-card p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1 min-w-[200px]">
                <p className="font-semibold">
                  {s.name}
                  <span className="text-[color:var(--gold)] font-bold ml-2">{Number(s.price).toFixed(0)} zł</span>
                </p>
                {s.description && <p className="text-xs text-muted-foreground mt-1">{s.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditSvc(s)}>
                  <Pencil className="h-4 w-4 mr-1" />Edytuj
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteSvc(s.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-12 mb-6">
          <Award className="h-5 w-5 text-[color:var(--gold)]" />
          <h2 className="font-display text-3xl">Nagrody (karnet lojalnościowy)</h2>
        </div>

        <div className="rounded-2xl border bg-card p-6 mb-12 space-y-4">
          <h2 className="font-display text-2xl">Treści strony — sekcja „O detailingu"</h2>
          <div>
            <Label>Tytuł</Label>
            <Input value={introTitle} onChange={(e) => setIntroTitle(e.target.value)} />
          </div>
          <div>
            <Label>Treść</Label>
            <Textarea rows={5} value={introBody} onChange={(e) => setIntroBody(e.target.value)} />
          </div>
          <Button onClick={saveIntro} disabled={savingIntro} className="btn-gold h-11">
            {savingIntro ? "Zapisywanie..." : "Zapisz treść"}
          </Button>
        </div>

        <form onSubmit={addReward} className="rounded-2xl border bg-card p-6 mb-8 space-y-4">
          <h3 className="font-semibold">Dodaj nową nagrodę</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Nazwa</Label>
              <Input value={rwName} onChange={(e) => setRwName(e.target.value)} placeholder="np. Mycie zewnętrzne gratis" required /></div>
            <div><Label>Koszt (pkt)</Label>
              <Input type="number" min={1} value={rwCost} onChange={(e) => setRwCost(Number(e.target.value))} required /></div>
            <div className="sm:col-span-2"><Label>Opis</Label>
              <Input value={rwDesc} onChange={(e) => setRwDesc(e.target.value)} /></div>
            <div className="sm:col-span-2"><Label>Link do zdjęcia (opcjonalny)</Label>
              <Input value={rwImage} onChange={(e) => setRwImage(e.target.value)} placeholder="https://..." /></div>
          </div>
          <Button type="submit" className="btn-gold h-11">Dodaj nagrodę</Button>
        </form>

        <div className="space-y-3">
          <h3 className="font-semibold">Aktualne nagrody ({rewards.length})</h3>
          {rewards.length === 0 && <p className="text-sm text-muted-foreground">Brak nagród.</p>}
          {rewards.map((r) => (
            <div key={r.id} className="rounded-xl border bg-card p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                {r.image_url && <img src={r.image_url} alt={r.name} className="h-12 w-12 object-cover rounded" />}
                <div>
                  <p className="font-semibold">{r.name} <span className="text-[color:var(--gold)] font-bold ml-2">{r.points_cost} pkt</span></p>
                  {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
                  {!r.is_active && <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">Nieaktywna</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditReward(r)}>
                  <Pencil className="h-4 w-4 mr-1" />Edytuj
                </Button>
                <Button size="sm" variant="outline" onClick={() => toggleReward(r)}>{r.is_active ? "Wyłącz" : "Włącz"}</Button>
                <Button size="sm" variant="ghost" onClick={() => deleteReward(r.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={!!editReward} onOpenChange={(v) => !v && setEditReward(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edytuj nagrodę</DialogTitle></DialogHeader>
            {editReward && (
              <div className="space-y-3">
                <div><Label>Nazwa</Label>
                  <Input value={editReward.name} onChange={(e) => setEditReward({ ...editReward, name: e.target.value })} /></div>
                <div><Label>Koszt (pkt)</Label>
                  <Input type="number" min={1} value={editReward.points_cost} onChange={(e) => setEditReward({ ...editReward, points_cost: Number(e.target.value) })} /></div>
                <div><Label>Opis</Label>
                  <Textarea rows={3} value={editReward.description ?? ""} onChange={(e) => setEditReward({ ...editReward, description: e.target.value })} /></div>
                <div><Label>Link do zdjęcia</Label>
                  <Input value={editReward.image_url ?? ""} onChange={(e) => setEditReward({ ...editReward, image_url: e.target.value })} placeholder="https://..." /></div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setEditReward(null)}>Anuluj</Button>
                  <Button onClick={saveRewardEdit} className="flex-1 btn-gold">Zapisz</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={!!editPkg} onOpenChange={(v) => !v && setEditPkg(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edytuj pakiet</DialogTitle></DialogHeader>
            {editPkg && (
              <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                <div><Label>Nazwa</Label>
                  <Input value={editPkg.name} onChange={(e) => setEditPkg({ ...editPkg, name: e.target.value })} /></div>
                <div><Label>Cena (zł)</Label>
                  <Input type="number" min={0} value={editPkg.price} onChange={(e) => setEditPkg({ ...editPkg, price: Number(e.target.value) })} /></div>
                <div><Label>Opis</Label>
                  <Textarea rows={3} value={editPkg.description ?? ""} onChange={(e) => setEditPkg({ ...editPkg, description: e.target.value })} /></div>
                <div><Label>Cechy (każda w nowej linii)</Label>
                  <Textarea rows={6} value={(editPkg.features || []).join("\n")}
                    onChange={(e) => setEditPkg({ ...editPkg, features: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })} /></div>
                <div><Label>Kolejność wyświetlania</Label>
                  <Input type="number" value={editPkg.sort_order} onChange={(e) => setEditPkg({ ...editPkg, sort_order: Number(e.target.value) })} /></div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={editPkg.is_featured} onCheckedChange={(v) => setEditPkg({ ...editPkg, is_featured: !!v })} />
                  <span className="text-sm">Oznacz jako polecany</span>
                </label>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setEditPkg(null)}>Anuluj</Button>
                  <Button onClick={savePkgEdit} className="flex-1 btn-gold">Zapisz</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={!!editSvc} onOpenChange={(v) => !v && setEditSvc(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edytuj usługę</DialogTitle></DialogHeader>
            {editSvc && (
              <div className="space-y-3">
                <div><Label>Nazwa</Label>
                  <Input value={editSvc.name} onChange={(e) => setEditSvc({ ...editSvc, name: e.target.value })} /></div>
                <div><Label>Cena (zł)</Label>
                  <Input type="number" min={0} value={editSvc.price} onChange={(e) => setEditSvc({ ...editSvc, price: Number(e.target.value) })} /></div>
                <div><Label>Opis</Label>
                  <Textarea rows={3} value={editSvc.description ?? ""} onChange={(e) => setEditSvc({ ...editSvc, description: e.target.value })} /></div>
                <div><Label>Kolejność wyświetlania</Label>
                  <Input type="number" value={editSvc.sort_order} onChange={(e) => setEditSvc({ ...editSvc, sort_order: Number(e.target.value) })} /></div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setEditSvc(null)}>Anuluj</Button>
                  <Button onClick={saveSvcEdit} className="flex-1 btn-gold">Zapisz</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}