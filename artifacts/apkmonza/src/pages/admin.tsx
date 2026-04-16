import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ShieldAlert, AlertTriangle, X, Edit } from "lucide-react";
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

  const stats = {
    total: apps.length,
    games: apps.filter((a) => a.type === "GAME").length,
    apps: apps.filter((a) => a.type === "APP").length,
    online: apps.filter((a) => a.status === "ONLINE").length,
  };

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
        <StatCard title="Online" value={stats.online} loading={isLoading} className="bg-primary text-primary-foreground" />
      </div>

      {/* Table */}
      <div className="bg-card border-4 border-black brutal-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-black border-b-4 border-black">
              <TableRow className="hover:bg-black">
                <TableHead className="font-black uppercase text-white py-4 w-12">ID</TableHead>
                <TableHead className="font-black uppercase text-white py-4">App</TableHead>
                <TableHead className="font-black uppercase text-white py-4">Version</TableHead>
                <TableHead className="font-black uppercase text-white py-4">Type / Cat</TableHead>
                <TableHead className="font-black uppercase text-white py-4">Status</TableHead>
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
                    <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : apps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 font-mono text-muted-foreground uppercase">
                    No apps found. Add your first mod.
                  </TableCell>
                </TableRow>
              ) : (
                apps.map((app) => (
                  <TableRow key={app.id} className="border-b-2 border-black hover:bg-muted/50 transition-colors">
                    <TableCell className="font-black text-sm text-muted-foreground">
                      #{app.id}
                    </TableCell>
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
