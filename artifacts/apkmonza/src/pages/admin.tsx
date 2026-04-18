import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Plus, Trash2, ShieldAlert, AlertTriangle, X, Edit, Search, Star, User } from "lucide-react";
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
  developer: string;
  developer_url: string;
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
  icon_color: "#",
  icon_initials: "",
  icon_url: "",
  package_name: "",
  download_url: "",
  is_recommended: false,
  developer: "",
  developer_url: "",
};

const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "16px",
};

const glassStrong: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "16px",
};

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "10px",
  color: "white",
  fontFamily: "inherit",
  fontSize: "13px",
  fontWeight: "700",
  padding: "8px 12px",
  width: "100%",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  color: "rgba(255,255,255,0.5)",
  fontSize: "10px",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  display: "block",
  marginBottom: "4px",
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
    const { data, error } = await supabase
      .from("ListAPKGAMES")
      .select("*")
      .order("id", { ascending: true });
    if (!error) setApps(data || []);
    setIsLoading(false);
  }

  useEffect(() => { fetchApps(); }, []);

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
      icon_color: app.icon_color || "",
      icon_initials: app.icon_initials || "",
      icon_url: app.icon_url || "",
      package_name: app.package_name || "",
      download_url: app.download_url || "",
      is_recommended: app.is_recommended || false,
      developer: app.developer || "",
      developer_url: app.developer_url || "",
    });
    setIsFormOpen(true);
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    if (editingApp) {
      const { error } = await supabase
        .from("ListAPKGAMES")
        .update({ ...form, uploaded_at: new Date().toISOString() })
        .eq("id", editingApp.id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Berhasil!", description: "App berhasil diupdate." });
        setIsFormOpen(false);
        fetchApps();
      }
    } else {
      const { error } = await supabase
        .from("ListAPKGAMES")
        .insert([{ ...form, uploaded_at: new Date().toISOString() }]);
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
    <div className="space-y-6">

      {/* HEADER */}
      <div
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-5"
        style={glassStrong}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #6366f1)",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(124,58,237,0.5)",
            }}
          >
            <ShieldAlert className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-black uppercase leading-none text-white">Admin Panel</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 font-black text-sm uppercase text-white transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #6366f1)",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(124,58,237,0.45)",
          }}
        >
          <Plus className="h-4 w-4" /> Add New Mod
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Mods", value: stats.total, accent: "#7c3aed", glow: "rgba(124,58,237,0.2)" },
          { title: "Games", value: stats.games, accent: "#6366f1", glow: "rgba(99,102,241,0.15)" },
          { title: "Apps", value: stats.apps, accent: "#8b5cf6", glow: "rgba(139,92,246,0.15)" },
          { title: "Kategori", value: stats.categories, accent: "#a78bfa", glow: "rgba(167,139,250,0.15)" },
        ].map((stat) => (
          <div
            key={stat.title}
            className="p-5 overflow-hidden relative"
            style={{ ...glass, boxShadow: `0 4px 20px ${stat.glow}` }}
          >
            <div
              className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-10"
              style={{ background: stat.accent, filter: "blur(20px)", transform: "translate(20%,-20%)" }}
            />
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {stat.title}
            </p>
            {isLoading ? (
              <div className="h-9 w-14 mt-1 animate-pulse rounded-lg" style={{ background: "rgba(255,255,255,0.1)" }} />
            ) : (
              <p className="text-4xl font-black mt-1" style={{ color: stat.accent }}>{stat.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div style={{ ...glass, overflow: "hidden" }}>

        {/* Search + Filter */}
        <div className="p-4 space-y-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: "rgba(255,255,255,0.3)" }}
            />
            <input
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="CARI MOD BERDASARKAN NAMA..."
              style={{ ...inputStyle, paddingLeft: "36px" }}
            />
          </div>
          <div className="flex gap-2 items-center">
            {[
              { label: "SEMUA", value: "" },
              { label: "ONLINE", value: "ONLINE" },
              { label: "OFFLINE", value: "OFFLINE" },
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value === statusFilter && value !== "" ? "" : value)}
                className="px-3 py-1 text-xs font-black uppercase transition-all"
                style={
                  statusFilter === value
                    ? {
                        background:
                          value === "ONLINE"
                            ? "rgba(34,197,94,0.25)"
                            : value === "OFFLINE"
                            ? "rgba(239,68,68,0.25)"
                            : "rgba(124,58,237,0.3)",
                        color:
                          value === "ONLINE" ? "#86efac" : value === "OFFLINE" ? "#fca5a5" : "#c4b5fd",
                        border: `1px solid ${
                          value === "ONLINE"
                            ? "rgba(34,197,94,0.4)"
                            : value === "OFFLINE"
                            ? "rgba(239,68,68,0.4)"
                            : "rgba(124,58,237,0.4)"
                        }`,
                        borderRadius: "999px",
                      }
                    : {
                        background: "rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.4)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "999px",
                      }
                }
              >
                {label}
              </button>
            ))}
            {(tableSearch || statusFilter) && (
              <span className="ml-auto text-xs font-bold uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>
                {filteredTableApps.length} hasil
              </span>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["ID", "App", "Developer", "Version", "Type / Cat", "Status", "Rec", "Actions"].map((h, i) => (
                  <th
                    key={h}
                    className="py-3 px-4 font-black uppercase text-xs tracking-widest"
                    style={{
                      color: "rgba(255,255,255,0.35)",
                      textAlign: i >= 6 ? "center" : "left",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div
                          className="h-6 animate-pulse rounded-lg"
                          style={{ background: "rgba(255,255,255,0.08)", width: j === 1 ? "140px" : "60px" }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredTableApps.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-12 font-black uppercase text-xs tracking-widest"
                    style={{ color: "rgba(255,255,255,0.2)" }}
                  >
                    {tableSearch || statusFilter
                      ? "Tidak ada mod yang sesuai filter."
                      : "No apps found. Add your first mod."}
                  </td>
                </tr>
              ) : (
                filteredTableApps.map((app) => (
                  <tr
                    key={app.id}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    className="transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-3 font-black text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                      #{app.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 shrink-0 flex items-center justify-center font-black text-xs overflow-hidden"
                          style={{
                            backgroundColor: app.icon_color || "#7c3aed",
                            borderRadius: "10px",
                            border: "1px solid rgba(255,255,255,0.12)",
                          }}
                        >
                          {app.icon_url ? (
                            <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white">{app.icon_initials || "AP"}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-black uppercase text-sm text-white">{app.name}</div>
                          <div className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                            {app.package_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 flex items-center justify-center shrink-0"
                          style={{
                            background: "rgba(124,58,237,0.2)",
                            borderRadius: "6px",
                          }}
                        >
                          <User className="h-3 w-3" style={{ color: "#c4b5fd" }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>
                          {app.developer || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                      {app.version}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className="text-[10px] font-black uppercase px-2 py-0.5"
                          style={{
                            background: "rgba(124,58,237,0.25)",
                            color: "#c4b5fd",
                            border: "1px solid rgba(124,58,237,0.3)",
                            borderRadius: "999px",
                          }}
                        >
                          {app.type}
                        </span>
                        <span className="text-[10px] font-bold uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
                          {app.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[10px] font-black uppercase px-2.5 py-0.5"
                        style={{
                          background: app.status === "ONLINE" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
                          color: app.status === "ONLINE" ? "#86efac" : "#fca5a5",
                          border: `1px solid ${app.status === "ONLINE" ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)"}`,
                          borderRadius: "999px",
                        }}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleRecommended(app)}
                        className="transition-all hover:scale-110"
                        style={{
                          background: app.is_recommended ? "rgba(234,179,8,0.2)" : "rgba(255,255,255,0.06)",
                          border: `1px solid ${app.is_recommended ? "rgba(234,179,8,0.4)" : "rgba(255,255,255,0.1)"}`,
                          borderRadius: "8px",
                          padding: "4px 6px",
                          color: app.is_recommended ? "#fde047" : "rgba(255,255,255,0.2)",
                        }}
                      >
                        <Star className="h-3.5 w-3.5" fill={app.is_recommended ? "currentColor" : "none"} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEdit(app)}
                          className="transition-all hover:scale-110 p-1.5"
                          style={{
                            background: "rgba(99,102,241,0.2)",
                            border: "1px solid rgba(99,102,241,0.3)",
                            borderRadius: "8px",
                            color: "#a5b4fc",
                          }}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteAppId(app.id)}
                          className="transition-all hover:scale-110 p-1.5"
                          style={{
                            background: "rgba(239,68,68,0.2)",
                            border: "1px solid rgba(239,68,68,0.3)",
                            borderRadius: "8px",
                            color: "#fca5a5",
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MODAL */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
            style={{
              background: "rgba(20,15,50,0.95)",
              backdropFilter: "blur(30px)",
              WebkitBackdropFilter: "blur(30px)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "20px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
            }}
          >
            {/* Modal Header */}
            <div
              className="flex items-center justify-between p-5 sticky top-0 z-10"
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(20,15,50,0.98)",
                borderRadius: "20px 20px 0 0",
              }}
            >
              <h2 className="font-black uppercase text-base text-white tracking-widest">
                {editingApp ? `Edit — ${editingApp.name}` : "Add New Mod"}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="transition-all hover:scale-110 p-1.5"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="p-5 space-y-3">

              {/* SECTION: Basic Info */}
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                — Basic Info
              </p>

              {[
                { label: "Name", name: "name" },
                { label: "Version", name: "version" },
                { label: "Size (e.g. 84MB)", name: "size" },
                { label: "Category", name: "category" },
              ].map(({ label, name }) => (
                <div key={name}>
                  <label style={labelStyle}>{label}</label>
                  <input name={name} value={(form as any)[name]} onChange={handleChange} style={inputStyle} />
                </div>
              ))}

              <div>
                <label style={labelStyle}>Type</label>
                <select name="type" value={form.type} onChange={handleChange} style={inputStyle}>
                  <option value="APP">APP</option>
                  <option value="GAME">GAME</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Status</label>
                <select name="status" value={form.status} onChange={handleChange} style={inputStyle}>
                  <option value="ONLINE">ONLINE</option>
                  <option value="OFFLINE">OFFLINE</option>
                </select>
              </div>

              {/* SECTION: Developer */}
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", paddingTop: "8px" }}>
                — Developer
              </p>

              {[
                { label: "Developer Name", name: "developer" },
                { label: "Developer URL (opsional)", name: "developer_url" },
              ].map(({ label, name }) => (
                <div key={name}>
                  <label style={labelStyle}>{label}</label>
                  <input name={name} value={(form as any)[name]} onChange={handleChange} style={inputStyle} />
                </div>
              ))}

              {/* SECTION: Mod Info */}
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", paddingTop: "8px" }}>
                — Mod Info
              </p>

              <div>
  <label style={labelStyle}>Mod Features Full</label>
  <textarea
    name="mod_features_full"
    value={form.mod_features_full}
    onChange={handleChange}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        if (e.shiftKey) {
          e.preventDefault();
          const target = e.target as HTMLTextAreaElement;
          const start = target.selectionStart;
          const end = target.selectionEnd;
          const val = form.mod_features_full;
          const newVal = val.substring(0, start) + "\n" + val.substring(end);
          setForm((prev) => ({ ...prev, mod_features_full: newVal }));
          setTimeout(() => {
            target.selectionStart = start + 1;
            target.selectionEnd = start + 1;
          }, 0);
        } else {
          e.preventDefault();
        }
      }
    }}
    rows={5}
    style={{
      ...inputStyle,
      resize: "vertical",
      lineHeight: "1.6",
    }}
  />
</div>

<div>
  <label style={labelStyle}>Description</label>
  <textarea
    name="description"
    value={form.description}
    onChange={handleChange}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        if (e.shiftKey) {
          e.preventDefault();
          const target = e.target as HTMLTextAreaElement;
          const start = target.selectionStart;
          const end = target.selectionEnd;
          const val = form.description;
          const newVal = val.substring(0, start) + "\n" + val.substring(end);
          setForm((prev) => ({ ...prev, description: newVal }));
          setTimeout(() => {
            target.selectionStart = start + 1;
            target.selectionEnd = start + 1;
          }, 0);
        } else {
          e.preventDefault();
        }
      }
    }}
    rows={4}
    style={{
      ...inputStyle,
      resize: "vertical",
      lineHeight: "1.6",
    }}
  />
</div>
              {/* SECTION: Icon & Package */}
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", paddingTop: "8px" }}>
                — Icon & Package
              </p>

              {[
                { label: "Icon Initials (e.g. SF)", name: "icon_initials" },
                { label: "Icon URL (opsional)", name: "icon_url" },
                { label: "Icon Color (hex)", name: "icon_color" },
                { label: "Package Name", name: "package_name" },
                { label: "Download URL", name: "download_url" },
              ].map(({ label, name }) => (
                <div key={name}>
                  <label style={labelStyle}>{label}</label>
                  <input name={name} value={(form as any)[name]} onChange={handleChange} style={inputStyle} />
                </div>
              ))}

              {/* Toggle Recommended */}
              <div
                className="flex items-center justify-between p-3 mt-2"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                }}
              >
                <div>
                  <p className="font-black uppercase text-xs text-white">Tampilkan di Recommended</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                    Muncul di bagian Recommended halaman utama
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, is_recommended: !prev.is_recommended }))}
                  className="flex items-center gap-1.5 px-3 py-1.5 font-black text-xs uppercase transition-all hover:scale-105"
                  style={
                    form.is_recommended
                      ? {
                          background: "rgba(234,179,8,0.25)",
                          color: "#fde047",
                          border: "1px solid rgba(234,179,8,0.4)",
                          borderRadius: "999px",
                        }
                      : {
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.4)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "999px",
                        }
                  }
                >
                  <Star className="h-3 w-3" fill={form.is_recommended ? "currentColor" : "none"} />
                  {form.is_recommended ? "YA" : "TIDAK"}
                </button>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full font-black uppercase text-sm text-white py-3.5 mt-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(124,58,237,0.45)",
                }}
              >
                {isSubmitting ? "Menyimpan..." : editingApp ? "Update" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE DIALOG */}
      <AlertDialog open={!!deleteAppId} onOpenChange={(open) => !open && setDeleteAppId(null)}>
        <AlertDialogContent
          className="p-0 overflow-hidden border-0 sm:max-w-md"
          style={{
            background: "rgba(20,15,50,0.97)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: "20px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          }}
        >
          <div
            className="p-5 flex items-center gap-3"
            style={{ borderBottom: "1px solid rgba(239,68,68,0.15)", background: "rgba(239,68,68,0.1)" }}
          >
            <div
              className="w-9 h-9 flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.25)", borderRadius: "10px" }}
            >
              <AlertTriangle className="h-5 w-5" style={{ color: "#fca5a5" }} />
            </div>
            <AlertDialogTitle className="text-base font-black uppercase m-0 text-white">
              Confirm Deletion
            </AlertDialogTitle>
          </div>
          <div className="p-5">
            <AlertDialogDescription className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.5)" }}>
              Yakin mau hapus app ini? Aksi ini tidak bisa dibatalkan.
            </AlertDialogDescription>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel
                className="font-black uppercase text-xs border-0"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.6)",
                  borderRadius: "10px",
                }}
              >
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="font-black uppercase text-xs border-0"
                style={{
                  background: "rgba(239,68,68,0.3)",
                  color: "#fca5a5",
                  border: "1px solid rgba(239,68,68,0.4)",
                  borderRadius: "10px",
                }}
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
