import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Plus, Trash2, AlertTriangle, X, Edit, Search, Star, User, LayoutGrid, Smartphone, Gamepad2, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type App = {
  id: number; name: string; version: string; size: string; type: string;
  category: string; status: string; description: string; mod_features: string;
  mod_features_full: string; icon_color: string; icon_initials: string;
  icon_url: string; package_name: string; download_url: string;
  uploaded_at: string; is_recommended: boolean; developer: string; developer_url: string;
};

const emptyForm = {
  name: "", version: "", size: "", type: "APP", category: "", status: "ONLINE",
  description: "", mod_features: "", mod_features_full: "", icon_color: "",
  icon_initials: "", icon_url: "", package_name: "", download_url: "",
  is_recommended: false, developer: "", developer_url: "",
};

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "16px",
};

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px",
  color: "white",
  fontFamily: "inherit",
  fontSize: "14px",
  fontWeight: "600",
  padding: "10px 14px",
  width: "100%",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  color: "rgba(255,255,255,0.45)",
  fontSize: "11px",
  fontWeight: 700,
  display: "block",
  marginBottom: "6px",
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

  const stats = {
    total: apps.length,
    apps: apps.filter((a) => a.type === "APP").length,
    games: apps.filter((a) => a.type === "GAME").length,
    recommended: apps.filter((a) => a.is_recommended).length,
  };

  const filteredApps = apps.filter((a) =>
    (a.name || "").toLowerCase().includes(tableSearch.toLowerCase())
  );

  async function fetchApps() {
    setIsLoading(true);
    const { data, error } = await supabase.from("ListAPKGAMES").select("*").order("id", { ascending: false });
    if (!error) setApps(data || []);
    setIsLoading(false);
  }

  useEffect(() => { fetchApps(); }, []);

  function openCreate() { setEditingApp(null); setForm(emptyForm); setIsFormOpen(true); }

  function openEdit(app: App) {
    setEditingApp(app);
    setForm({
      name: app.name || "", version: app.version || "", size: app.size || "",
      type: app.type || "APP", category: app.category || "", status: app.status || "ONLINE",
      description: app.description || "", mod_features: app.mod_features || "",
      mod_features_full: app.mod_features_full || "", icon_color: app.icon_color || "",
      icon_initials: app.icon_initials || "", icon_url: app.icon_url || "",
      package_name: app.package_name || "", download_url: app.download_url || "",
      is_recommended: app.is_recommended || false, developer: app.developer || "",
      developer_url: app.developer_url || "",
    });
    setIsFormOpen(true);
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    if (editingApp) {
      const { error } = await supabase.from("ListAPKGAMES")
        .update({ ...form, uploaded_at: new Date().toISOString() }).eq("id", editingApp.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else { toast({ title: "Berhasil!", description: "App diupdate." }); setIsFormOpen(false); fetchApps(); }
    } else {
      const { error } = await supabase.from("ListAPKGAMES")
        .insert([{ ...form, uploaded_at: new Date().toISOString() }]);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else { toast({ title: "Berhasil!", description: "App ditambahkan." }); setIsFormOpen(false); setForm(emptyForm); fetchApps(); }
    }
    setIsSubmitting(false);
  }

  async function handleDelete() {
    if (!deleteAppId) return;
    const { error } = await supabase.from("ListAPKGAMES").delete().eq("id", deleteAppId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Dihapus" }); fetchApps(); }
    setDeleteAppId(null);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function toggleRecommended(app: App) {
    const newVal = !app.is_recommended;
    const { error } = await supabase.from("ListAPKGAMES").update({ is_recommended: newVal }).eq("id", app.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: newVal ? "Ditambahkan ke Recommended" : "Dihapus dari Recommended" }); fetchApps(); }
  }

  return (
    <div className="space-y-5 pb-8">

      {/* HEADER */}
      <div className="flex items-start justify-between pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutGrid className="h-5 w-5" style={{ color: "#a78bfa" }} />
            <h1 className="text-xl font-black text-white">Admin Panel</h1>
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Manage your APK store</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2.5 font-black text-xs uppercase text-white transition-all hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #6366f1)",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(124,58,237,0.4)",
          }}
        >
          <Plus className="h-3.5 w-3.5" /> Add App
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: <LayoutGrid className="h-5 w-5" />, value: stats.total, label: "Total Apps", color: "#a78bfa" },
          { icon: <Smartphone className="h-5 w-5" />, value: stats.apps, label: "Apps", color: "#a78bfa" },
          { icon: <Gamepad2 className="h-5 w-5" />, value: stats.games, label: "Games", color: "#fb923c" },
          { icon: <Star className="h-5 w-5" />, value: stats.recommended, label: "Recommended", color: "#fbbf24" },
        ].map((s) => (
          <div key={s.label} className="p-4" style={cardStyle}>
            <span style={{ color: s.color }}>{s.icon}</span>
            <p className="text-3xl font-black text-white mt-2">{isLoading ? "-" : s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* SEARCH */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px" }}
      >
        <Search className="h-4 w-4 shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
        <input
          value={tableSearch}
          onChange={(e) => setTableSearch(e.target.value)}
          placeholder="Search apps..."
          style={{ background: "none", border: "none", outline: "none", color: "white", fontFamily: "inherit", fontSize: "14px", width: "100%" }}
        />
      </div>

      {/* APP LIST */}
      <div style={{ ...cardStyle, overflow: "hidden" }}>
        <div className="px-4 py-3 flex justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="text-xs font-black uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>APP</span>
          <span className="text-xs font-black uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>ACTIONS</span>
        </div>

        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-4 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="w-10 h-10 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.08)" }} />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.08)" }} />
                <div className="h-3 w-20 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
              </div>
            </div>
          ))
        ) : filteredApps.length === 0 ? (
          <div className="py-12 text-center text-sm font-bold" style={{ color: "rgba(255,255,255,0.2)" }}>
            No apps found
          </div>
        ) : (
          filteredApps.map((app, i) => (
            <div
              key={app.id}
              className="px-4 py-3 flex items-center gap-3 hover:bg-white/[0.03] transition-colors"
              style={{ borderBottom: i < filteredApps.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
            >
              <div
                className="w-11 h-11 shrink-0 overflow-hidden flex items-center justify-center font-black text-xs"
                style={{ borderRadius: "12px", backgroundColor: app.icon_color || "#7c3aed", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {app.icon_url ? (
                  <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white">{app.icon_initials || "AP"}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm text-white truncate">{app.name}</p>
                <p className="text-xs font-bold" style={{ color: "#a78bfa" }}>{app.mod_features || app.type}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleRecommended(app)}
                  style={{ color: app.is_recommended ? "#fbbf24" : "rgba(255,255,255,0.2)", padding: "4px" }}
                >
                  <Star className="h-4 w-4" fill={app.is_recommended ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={() => openEdit(app)}
                  style={{ color: "rgba(255,255,255,0.4)", padding: "4px" }}
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteAppId(app.id)}
                  style={{ color: "rgba(239,68,68,0.6)", padding: "4px" }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FORM MODAL */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto"
            style={{
              background: "rgba(12,10,35,0.98)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "20px 20px 0 0",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.6)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 sticky top-0 z-10"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(12,10,35,0.99)", borderRadius: "20px 20px 0 0" }}
            >
              <div>
                <h2 className="font-black text-base text-white">
                  {editingApp ? "Edit App" : "Add New App"}
                </h2>
                {editingApp && <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{editingApp.name}</p>}
              </div>
              <button onClick={() => setIsFormOpen(false)} style={{ color: "rgba(255,255,255,0.4)", padding: "4px" }}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">

              {/* Recommended checkbox */}
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, is_recommended: !prev.is_recommended }))}
                className="w-full flex items-center gap-3 p-3 transition-all"
                style={{
                  background: form.is_recommended ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${form.is_recommended ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: "12px",
                }}
              >
                <div
                  className="w-5 h-5 flex items-center justify-center shrink-0"
                  style={{
                    background: form.is_recommended ? "#7c3aed" : "rgba(255,255,255,0.08)",
                    borderRadius: "5px",
                    border: form.is_recommended ? "none" : "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  {form.is_recommended && <span className="text-white text-xs">✓</span>}
                </div>
                <span className="text-sm font-bold text-white">Mark as Recommended</span>
              </button>

              {/* Basic Info */}
              <div>
                <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: "#a78bfa" }}>Basic Info</p>
                <div className="space-y-3">
                  {[
                    { label: "App Name *", name: "name", placeholder: "e.g. WhatsApp" },
                    { label: "Icon URL", name: "icon_url", placeholder: "https://..." },
                  ].map(({ label, name, placeholder }) => (
                    <div key={name}>
                      <label style={labelStyle}>{label}</label>
                      <input name={name} value={(form as any)[name]} onChange={handleChange} placeholder={placeholder} style={{ ...inputStyle, color: (form as any)[name] ? "white" : "rgba(255,255,255,0.3)" }} />
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
                    <label style={labelStyle}>Category</label>
                    <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
                      <option value="">Other</option>
                      {["Photography", "Video Editor", "Tools", "Social", "Productivity", "Games", "Education", "Entertainment"].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Mod Type</label>
                    <select name="mod_features" value={form.mod_features} onChange={handleChange} style={inputStyle}>
                      <option value="-">-</option>
                      <option value="PRO">PRO</option>
                      <option value="PRO [Paid]">PRO [Paid]</option>
                      <option value="Premium">Premium</option>
                      <option value="Unlocked">Unlocked</option>
                      <option value="MOD">MOD</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Status</label>
                    <select name="status" value={form.status} onChange={handleChange} style={inputStyle}>
                      <option value="ONLINE">ONLINE</option>
                      <option value="OFFLINE">OFFLINE</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tech Specs */}
              <div>
                <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: "#a78bfa" }}>Tech Specs</p>
                <div className="space-y-3">
                  {[
                    { label: "Version", name: "version" },
                    { label: "Size", name: "size" },
                    { label: "Package Name", name: "package_name" },
                  ].map(({ label, name }) => (
                    <div key={name}>
                      <label style={labelStyle}>{label}</label>
                      <input name={name} value={(form as any)[name]} onChange={handleChange} style={inputStyle} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Developer */}
              <div>
                <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: "#a78bfa" }}>Developer</p>
                <div className="space-y-3">
                  {[
                    { label: "Developer Name", name: "developer" },
                    { label: "Developer URL", name: "developer_url" },
                  ].map(({ label, name }) => (
                    <div key={name}>
                      <label style={labelStyle}>{label}</label>
                      <input name={name} value={(form as any)[name]} onChange={handleChange} style={inputStyle} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: "#a78bfa" }}>Content</p>
                <div className="space-y-3">
                  <div>
                    <label style={labelStyle}>Mod Features Full</label>
                    <textarea
                      name="mod_features_full"
                      value={form.mod_features_full}
                      onChange={(e) => setForm((prev) => ({ ...prev, mod_features_full: e.target.value }))}
                      rows={4}
                      style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6" }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Description</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6" }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Download URL</label>
                    <input name="download_url" value={form.download_url} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div>
