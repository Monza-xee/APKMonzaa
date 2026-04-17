import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ShieldAlert, AlertTriangle, X, Edit, Search, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type App = {
  id: number;
  name: string;
  version: string;
  size: string;
  type: string;
  category: string;
  status: string;
  description: string;
  mod_features: string;
  mod_features_full: string;
  icon_color: string;
  icon_initials: string;
  icon_url: string;
  package_name: string;
  download_url: string;
  uploaded_at: string;
  is_recommended: boolean;
};

const emptyForm = {
  name: "",
  version: "",
  size: "",
  type: "APP",
  category: "",
  status: "ONLINE",
  description: "",
  mod_features: "",
  mod_features_full: "",
  icon_color: "#facc15",
  icon_initials: "",
  icon_url: "",
  package_name: "",
  download_url: "",
  is_recommended: false,
};

export function Admin() {
  const { toast } = useToast();
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteAppId, setDeleteAppId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<App | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tableSearch, setTableSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const stats = {
    total: apps.length,
    games: apps.filter((a) => a.type === "GAME").length,
    apps: apps.filter((a) => a.type === "APP").length,
    categories: new Set(apps.map((a) => a.category).filter(Boolean)).size,
  };

  const filteredTableApps = apps.filter((a) => {
    const matchName = (a.name || "").toLowerCase().includes(tableSearch.toLowerCase());
    const matchStatus = statusFilter ? a.status === statusFilter : true;
    return matchName && matchStatus;
  });

  async function fetchApps() {
    setIsLoading(true);
    const { data, error } = await supabase.from("ListAPKGAMES").select("*").order("id", { ascending: true });
    if (!error) setApps(data || []);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchApps();
  }, []);

  function openCreate() {
    setEditingApp(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  }

  function openEdit(app: App) {
    setEditingApp(app);
    setForm({
      name: app.name || "",
      version: app.version || "",
      size: app.size || "",
      type: app.type || "APP",
      category: app.category || "",
      status: app.status || "ONLINE",
      description: app.description || "",
      mod_features: app.mod_features || "",
      mod_features_full: app.mod_features_full || "",
      icon_color: app.icon_color || "#facc15",
      icon_initials: app.icon_initials || "",
      icon_url: app.icon_url || "",
      package_name: app.package_name || "",
      download_url: app.download_url || "",
      is_recommended: app.is_recommended || false,
    });
    setIsFormOpen(true);
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    if (editingApp) {
      const { error } = await supabase
        .from("ListAPKGAMES")
        .update({ ...form })
        .eq("id", editingApp.id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Berhasil!", description: "App berhasil diupdate." });
        setIsFormOpen(false);
        fetchApps();
      }
    } else {
      const { error } = await supabase.from("ListAPKGAMES").insert([
        { ...form, uploaded_at: new Date().toISOString() },
      ]);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Berhasil!", description: "App berhasil ditambahkan." });
        setIsFormOpen(false);
        setForm(emptyForm);
        fetchApps();
      }
    }
    setIsSubmitting(false);
  }

  async function handleDelete() {
    if (!deleteAppId) return;
    const { error } = await supabase.from("ListAPKGAMES").delete().eq("id", deleteAppId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Dihapus", description: "App berhasil dihapus." });
      fetchApps();
    }
    setDeleteAppId(null);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function toggleRecommended(app: App) {
    const newVal = !app.is_recommended;
    const { error } = await supabase
      .from("ListAPKGAMES")
      .update({ is_recommended: newVal })
      .eq("id", app.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: newVal ? "Ditambahkan ke Recommended" : "Dihapus dari Recommended",
        description: `${app.name} ${newVal ? "sekarang tampil" : "tidak lagi tampil"} di Recommended.`,
      });
      fetchApps();
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border-4 border-black p-6 brutal-shadow">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-black uppercase m-0 leading-none">Admin Panel</h1>
        </div>
        <Button
          onClick={openCreate}
          className="rounded-none border-4 border-black font-black uppercase text-lg h-12 px-6 brutal-shadow-sm brutal-shadow-hover"
        >
          <Plus className="mr-2 h-5 w-5" /> Add New Mod
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Mods" value={stats.total} loading={isLoading} className="bg-secondary text-secondary-foreground" />
        <StatCard title="Games" value={stats.games} loading={isLoading} className="bg-card" />
        <StatCard title="Apps" value={stats.apps} loading={isLoading} className="bg-card" />
        <StatCard title="Kategori" value={stats.categories} loading={isLoading} className="bg-primary text-primary-foreground" />
      </div>

      {/* Table */}
      <div className="bg-card border-4 border-black brutal-shadow overflow-hidden">

        {/* Search + Filter Status */}
        <div className="p-4 border-b-4 border-black space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="CARI MOD BERDASARKAN NAMA..."
              className="pl-10 border-2 border-black rounded-none font-mono uppercase"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter("")}
              className={`px-3 py-1 border-2 border-black font-black text-xs uppercase rounded-none transition-colors ${
                statusFilter === "" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              SEMUA
            </button>
            <button
              onClick={() => setStatusFilter(statusFilter === "ONLINE" ? "" : "ONLINE")}
              className={`px-3 py-1 border-2 border-black font-black text-xs uppercase rounded-none transition-colors ${
                statusFilter === "ONLINE" ? "bg-green-500 text-white border-green-600" : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              ONLINE
            </button>
            <button
              onClick={() => setStatusFilter(statusFilter === "OFFLINE" ? "" : "OFFLINE")}
              className={`px-3 py-1 border-2 border-black font-black text-xs uppercase rounded-none transition-colors ${
                statusFilter === "OFFLINE" ? "bg-red-500 text-white border-red-600" : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              OFFLINE
            </button>
            {(tableSearch || statusFilter) && (
              <span className="ml-auto text-xs font-bold uppercase text-muted-foreground self-center">
                {filteredTableApps.length} hasil
              </span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-black border-b-4 border-black">
              <TableRow className="hover:bg-black">
                <TableHead className="font-black uppercase text-white py-4 w-12">ID</TableHead>
                <TableHead className="font-black uppercase text-white py-4">App</TableHead>
                <TableHead className="font-black uppercase text-white py-4">Version</TableHead>
                <TableHead className="font-black uppercase text-white py-4">Type / Cat</TableHead>
                <TableHead className="font-black uppercase text-white py-4">Status</TableHead>
                <TableHead className="font-black uppercase text-white py-4 text-center">Rec</TableHead>
                <TableHead className="font-black uppercase text-white py-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-6 w-6" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredTableApps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 font-mono text-muted-foreground uppercase">
                    {tableSearch || statusFilter ? "Tidak ada mod yang sesuai filter." : "No apps found. Add your first mod."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTableApps.map((app) => (
                  <TableRow key={app.id} className="border-b-2 border-black hover:bg-muted/50 transition-colors">
                    <TableCell className="font-black text-sm text-muted-foreground">#{app.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 border-2 border-black flex items-center justify-center font-black text-sm shrink-0 overflow-hidden"
                          style={{ backgroundColor: app.icon_color || "#facc15" }}
                        >
                          {app.icon_url ? (
                            <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
                          ) : (
                            app.icon_initials || "AP"
                          )}
                        </div>
                        <div>
                          <div className="font-black uppercase text-base">{app.name}</div>
                          <div className="font-mono text-xs text-muted-foreground">{app.package_name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{app.version}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge className="rounded-none border border-black bg-primary text-primary-foreground font-bold text-[10px] uppercase">
                          {app.type}
                        </Badge>
                        <span className="font-mono text-xs font-bold uppercase">{app.category}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`rounded-none border border-black font-bold text-[10px] uppercase ${app.status === "ONLINE" ? "bg-secondary text-secondary-foreground" : "bg-accent text-accent-foreground"}`}>
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => toggleRecommended(app)}
                        title={app.is_recommended ? "Hapus dari Recommended" : "Tambah ke Recommended"}
                        className={`p-1 border-2 border-black rounded-none transition-colors ${
                          app.is_recommended
                            ? "bg-yellow-400 text-black hover:bg-yellow-300"
                            : "bg-white text-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        <Star className="h-4 w-4" fill={app.is_recommended ? "currentColor" : "none"} />
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEdit(app)}
                          className="rounded-none border-2 border-black h-8 w-8 hover:bg-primary hover:text-primary-foreground"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => setDeleteAppId(app.id)}
                          className="rounded-none border-2 border-black h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black brutal-shadow w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b-4 border-black bg-primary text-primary-foreground">
              <h2 className="font-black uppercase text-xl">
                {editingApp ? `Edit #${editingApp.id} — ${editingApp.name}` : "Add New Mod"}
              </h2>
              <button onClick={() => setIsFormOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {[
                { label: "Name", name: "name" },
                { label: "Version", name: "version" },
                { label: "Size (e.g. 84MB)", name: "size" },
                { label: "Category (e.g. ACTION)", name: "category" },
                { label: "Mod Features", name: "mod_features" },
                { label: "Mod Features Full", name: "mod_features_full" },
                { label: "Description", name: "description" },
                { label: "Icon Initials (e.g. SF)", name: "icon_initials" },
                { label: "Icon URL (opsional)", name: "icon_url" },
                { label: "Icon Color (hex)", name: "icon_color" },
                { label: "Package Name", name: "package_name" },
                { label: "Download URL", name: "download_url" },
              ].map(({ label, name }) => (
                <div key={name}>
                  <label className="font-black uppercase text-xs block mb-1">{label}</label>
                  <Input
                    name={name}
                    value={(form as any)[name]}
                    onChange={handleChange}
                    className="rounded-none border-2 border-black"
                  />
                </div>
              ))}

              <div>
                <label className="font-black uppercase text-xs block mb-1">Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full border-2 border-black p-2 font-bold uppercase text-sm"
                >
                  <option value="APP">APP</option>
                  <option value="GAME">GAME</option>
                </select>
              </div>

              <div>
                <label className="font-black uppercase text-xs block mb-1">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full border-2 border-black p-2 font-bold uppercase text-sm"
                >
                  <option value="ONLINE">ONLINE</option>
                  <option value="OFFLINE">OFFLINE</option>
                </select>
              </div>

              {/* Toggle Recommended */}
              <div className="flex items-center justify-between border-2 border-black p-3">
                <div>
                  <p className="font-black uppercase text-xs">Tampilkan di Recommended</p>
                  <p className="text-xs text-muted-foreground">Muncul di bagian Recommended halaman utama</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, is_recommended: !prev.is_recommended }))}
                  className={`flex items-center gap-1 px-3 py-1 border-2 border-black font-black text-xs uppercase rounded-none transition-colors ${
                    form.is_recommended
                      ? "bg-yellow-400 text-black"
                      : "bg-white text-black hover:bg-gray-100"
                  }`}
                >
                  <Star className="h-3 w-3" fill={form.is_recommended ? "currentColor" : "none"} />
                  {form.is_recommended ? "YA" : "TIDAK"}
                </button>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full rounded-none border-2 border-black font-black uppercase h-12 mt-2"
              >
                {isSubmitting ? "Menyimpan..." : editingApp ? "Update" : "Simpan"}
              </Button>
            </div>
          </div>
        </div>
      )}

            {/* Delete Dialog */}
      <AlertDialog open={!!deleteAppId} onOpenChange={(open) => !open && setDeleteAppId(null)}>
        <AlertDialogContent className="rounded-none border-4 border-black brutal-shadow-lg p-0 overflow-hidden sm:max-w-md">
          <div className="bg-destructive text-destructive-foreground p-6 border-b-4 border-black flex items-center gap-3">
            <AlertTriangle className="h-8 w-8" />
            <AlertDialogTitle className="text-2xl font-black uppercase m-0">Confirm Deletion</AlertDialogTitle>
          </div>
          <div className="p-6 bg-card">
            <AlertDialogDescription className="font-mono text-base text-foreground mb-6">
              Yakin mau hapus app ini? Aksi ini tidak bisa dibatalkan.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-none border-2 border-black font-black uppercase">Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="rounded-none border-2 border-black bg-destructive text-destructive-foreground font-black uppercase hover:bg-destructive/90"
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
function StatCard({ title, value, loading, className = "" }: { title: string; value?: number; loading: boolean; className?: string }) {
  return (
    <Card className={`rounded-none border-4 border-black brutal-shadow ${className}`}>
      <CardHeader className="pb-2 border-b-2 border-black/10">
        <CardTitle className="text-sm font-black uppercase opacity-80">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? <Skeleton className="h-10 w-16" /> : <div className="text-4xl font-black">{value || 0}</div>}
      </CardContent>
    </Card>
  );
}
Home.tsx — bagian recommended diubah supaya pakai data is_recommended:

Ganti baris ini:

const recommended = allApps.slice(0, 6);
Jadi:

const recommended = allApps.filter((app) => app.is_recommended);
Yang ditambahkan/diubah:

Kolom bintang (★) di tabel — klik langsung toggle masuk/keluar Recommended tanpa buka form edit, langsung tersimpan ke Supabase
Toggle di dalam form — bisa diatur juga saat tambah atau edit mod
Home.tsx — Recommended sekarang hanya tampilkan yang is_recommended = true
Jangan lupa tambah kolom is_recommended (boolean, default false) di tabel Supabase dulu ya!

Selanjutnya, saya bisa tambahkan badge "BARU" merah otomatis di kartu yang diupload dalam 7 hari terakhir. Mau ditambahkan?

import { useState, useEffect } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Box, Gamepad2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function Home() {
const [search, setSearch] = useState("");
const [typeFilter, setTypeFilter] = useState("");
const [categoryFilter, setCategoryFilter] = useState("");
const [apps, setApps] = useState<any[]>([]);
const [allApps, setAllApps] = useState<any[]>([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
async function fetchAllApps() {
const { data, error } = await supabase.from("ListAPKGAMES").select("*");
if (!error) setAllApps(data || []);
}
fetchAllApps();
}, []);

useEffect(() => {
async function fetchApps() {
setIsLoading(true);
let query = supabase.from("ListAPKGAMES").select("*");
if (typeFilter) query = query.eq("type", typeFilter);
const { data, error } = await query;
if (!error) setApps(data || []);
setIsLoading(false);
}
fetchApps();
}, [typeFilter]);

const categories = Array.from(
new Set(apps.map((app) => app.category).filter(Boolean))
) as string[];

const filteredApps = apps.filter((app) => {
const matchSearch = (app.name || "").toLowerCase().includes(search.toLowerCase());
const matchCategory = categoryFilter ? app.category === categoryFilter : true;
return matchSearch && matchCategory;
});

const recommended = allApps.filter((app) => app.is_recommended);

return (
<div className="space-y-6 pt-0 px-4 pb-4">

  {/* SEARCH + FILTER */}
  <section className="flex flex-col gap-4 border-4 border-black p-4 brutal-shadow bg-white -mt-4">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="SEARCH GAMES OR APPS..."
        className="pl-10 border-2 border-black rounded-none font-mono uppercase"
      />
    </div>
    <div className="flex gap-2">
      <Button
        onClick={() => setTypeFilter("")}
        className={`border-2 border-black font-black rounded-none ${
          typeFilter === ""
            ? "bg-yellow-400 text-black hover:bg-yellow-300"
            : "bg-white text-black hover:bg-gray-100"
        }`}
      >
        ALL
      </Button>
      <Button
        onClick={() => setTypeFilter("GAME")}
        className={`border-2 border-black font-black rounded-none ${
          typeFilter === "GAME"
            ? "bg-yellow-400 text-black hover:bg-yellow-300"
            : "bg-white text-black hover:bg-gray-100"
        }`}
      >
        <Gamepad2 className="mr-1 h-4 w-4" /> GAMES
      </Button>
      <Button
        onClick={() => setTypeFilter("APP")}
        className={`border-2 border-black font-black rounded-none ${
          typeFilter === "APP"
            ? "bg-yellow-400 text-black hover:bg-yellow-300"
            : "bg-white text-black hover:bg-gray-100"
        }`}
      >
        <Box className="mr-1 h-4 w-4" /> APPS
      </Button>
    </div>
    {/* FILTER KATEGORI */}
    {categories.length > 0 && (
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setCategoryFilter("")}
          className={`shrink-0 px-3 py-1 border-2 border-black font-black text-xs uppercase rounded-none transition-colors ${
            categoryFilter === ""
              ? "bg-black text-yellow-400"
              : "bg-white text-black hover:bg-gray-100"
          }`}
        >
          SEMUA
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat === categoryFilter ? "" : cat)}
            className={`shrink-0 px-3 py-1 border-2 border-black font-black text-xs uppercase rounded-none transition-colors ${
              categoryFilter === cat
                ? "bg-black text-yellow-400"
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    )}
  </section>
  {/* RECOMMENDED - horizontal scroll */}
  <section>
    <h2 className="font-black uppercase text-base mb-3 border-l-4 border-yellow-400 pl-2">
      RECOMMENDED
    </h2>
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
      {allApps.length === 0
        ? [1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-44 h-36 shrink-0 border-4 border-black" />
          ))
        : recommended.map((app) => (
            <Link key={app.id} href={`/app/${app.id}`}>
              <div className="w-44 shrink-0 border-4 border-black brutal-shadow bg-white cursor-pointer hover:translate-x-0.5 hover:translate-y-0.5 transition-transform">
                <div
                  className="w-full h-24 flex items-center justify-center font-black text-sm overflow-hidden border-b-4 border-black"
                  style={{ backgroundColor: app.icon_color || "#facc15" }}
                >
                  {app.icon_url ? (
                    <img
                      src={app.icon_url}
                      alt={app.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    app.icon_initials || "AP"
                  )}
                </div>
                <div className="p-2">
                  <p className="font-black text-xs uppercase leading-tight line-clamp-2">
                    {app.name || "NO NAME"}
                  </p>
                  <div className="flex gap-1 flex-wrap mt-1">
                    <Badge className="bg-yellow-400 text-black border-0 rounded-none font-bold uppercase text-[10px] px-1">
                      {app.type || "-"}
                    </Badge>
                    {app.category && (
                      <Badge className="bg-white text-black border-2 border-black rounded-none font-bold uppercase text-[10px] px-1">
                        {app.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
    </div>
  </section>
  {/* LIST */}
  <section>
    <h2 className="font-black uppercase text-base mb-3 border-l-4 border-black pl-2">
      NEW APPS / GAMES UPDATE
    </h2>
    {isLoading ? (
      <div className="grid gap-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-40 border-4 border-black" />
        ))}
      </div>
    ) : filteredApps.length === 0 ? (
      <div className="border-4 border-black p-10 text-center font-black uppercase">
        No Mods Found
      </div>
    ) : (
      <div className="grid gap-4">
        {filteredApps.map((app) => (
          <Link key={app.id} href={`/app/${app.id}`}>
            <Card className="border-4 border-black brutal-shadow flex flex-col rounded-none cursor-pointer hover:translate-x-1 hover:translate-y-1 transition-transform">
              {/* MOD INFO */}
              <div className="bg-purple-100 border-b-4 border-black px-4 py-3">
                <p className="font-black text-lg uppercase leading-tight">
                  {app.mod_features || "UNLOCKED"}
                </p>
              </div>
              {/* CONTENT */}
              <CardContent className="p-4">
                <div className="flex gap-4 mb-3 items-center">
                  <div
                    className="w-14 h-14 border-4 border-black flex items-center justify-center font-black text-sm shrink-0 overflow-hidden"
                    style={{ backgroundColor: app.icon_color || "#facc15" }}
                  >
                    {app.icon_url ? (
                      <img
                        src={app.icon_url}
                        alt={app.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      app.icon_initials || "AP"
                    )}
                  </div>
                  <div className="flex flex-col justify-center">
                    <h2 className="font-black text-lg uppercase leading-tight">
                      {app.name || "NO NAME"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      v{app.version || "1.0"} • {app.size || "??MB"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-yellow-400 text-black border-0 rounded-none font-bold uppercase text-xs">
                    {app.type || "-"}
                  </Badge>
                  <Badge className="bg-white text-black border-2 border-black rounded-none font-bold uppercase text-xs">
                    {app.category || "-"}
                  </Badge>
                  <Badge className="bg-purple-600 text-white border-0 rounded-none font-bold uppercase text-xs">
                    {app.status || "OFFLINE"}
                  </Badge>
                  <Badge className="bg-white text-black border-2 border-black rounded-none font-bold uppercase text-xs">
                    {app.uploaded_at
                      ? new Date(app.uploaded_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    )}
  </section>
</div>
);
}
