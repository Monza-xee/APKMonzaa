import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  Plus, Trash2, AlertTriangle, X, Edit, Search, Star,
  LayoutGrid, Smartphone, Gamepad2, LogOut, Lock, Mail, User,
} from "lucide-react";
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

type UserProfile = {
  id: string; username: string; email: string; created_at: string;
};

const ADMIN_EMAIL = "admin@monza.com";

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

  // Auth
  const [sessionChecked, setSessionChecked] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Apps
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteAppId, setDeleteAppId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<App | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tableSearch, setTableSearch] = useState("");

  // Users
  const [activeTab, setActiveTab] = useState<"apps" | "users">("apps");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const isAuthenticated = userEmail === ADMIN_EMAIL;

  const stats = {
    total: apps.length,
    apps: apps.filter((a) => a.type === "APP").length,
    games: apps.filter((a) => a.type === "GAME").length,
    recommended: apps.filter((a) => a.is_recommended).length,
  };

  const filteredApps = apps.filter((a) =>
    (a.name || "").toLowerCase().includes(tableSearch.toLowerCase())
  );

  const filteredUsers = users.filter((u) =>
    (u.username || "").toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(userSearch.toLowerCase())
  );

  // Auth listener
  useEffect(() => {
    let mounted = true;
    async function initAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      setUserEmail(session?.user?.email ?? null);
      setSessionChecked(true);
    }
    initAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
      setSessionChecked(true);
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchApps();
      fetchUsers();
    } else {
      setApps([]);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  async function fetchApps() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("ListAPKGAMES").select("*").order("id", { ascending: false });
    if (!error) setApps(data || []);
    setIsLoading(false);
  }

  async function fetchUsers() {
    setUsersLoading(true);
    const { data, error } = await supabase
      .from("profiles").select("*").order("created_at", { ascending: false });
    if (!error) setUsers(data || []);
    setUsersLoading(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsAuthLoading(true);
    setLoginError("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    });
    if (error) {
      setLoginError(error.message);
      toast({ title: "Login gagal", description: error.message, variant: "destructive" });
      setIsAuthLoading(false);
      return;
    }
    if (data.user?.email !== ADMIN_EMAIL) {
      await supabase.auth.signOut();
      setLoginError("Akun ini bukan admin.");
      toast({ title: "Akses ditolak", description: "Akun ini bukan admin.", variant: "destructive" });
      setIsAuthLoading(false);
      return;
    }
    toast({ title: "Login berhasil", description: "Selamat datang di Admin Panel" });
    setIsAuthLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUserEmail(null);
    setApps([]);
    setUsers([]);
    setIsFormOpen(false);
    setEditingApp(null);
    setDeleteAppId(null);
    toast({ title: "Logout berhasil" });
  }

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
    if (!form.name.trim()) {
      toast({ title: "Error", description: "App Name wajib diisi.", variant: "destructive" });
      return;
    }
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

  async function handleUpdatePassword() {
    if (!editingUser || !newPassword || newPassword.length < 6) {
      toast({ title: "Error", description: "Password minimal 6 karakter", variant: "destructive" });
      return;
    }
    setIsSavingPassword(true);
    const { error } = await supabase.functions.invoke("admin-update-password", {
      body: { userId: editingUser.id, newPassword },
    });
    if (error) {
      toast({ title: "Error", description: "Gagal update password. Pastikan Edge Function sudah dibuat.", variant: "destructive" });
    } else {
      toast({ title: "Berhasil!", description: "Password berhasil diupdate." });
      setIsPasswordModalOpen(false);
      setNewPassword("");
      setEditingUser(null);
    }
    setIsSavingPassword(false);
  }

  // Loading session
  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="px-6 py-4 text-sm font-bold text-white" style={cardStyle}>Loading...</div>
      </div>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div
          className="w-full max-w-md p-6"
          style={{ ...cardStyle, background: "rgba(12,10,35,0.96)", boxShadow: "0 20px 60px rgba(0,0,0,0.45)" }}
        >
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <div
                className="w-14 h-14 flex items-center justify-center"
                style={{ borderRadius: "16px", background: "linear-gradient(135deg, #7c3aed, #6366f1)", boxShadow: "0 10px 30px rgba(124,58,237,0.35)" }}
              >
                <Lock className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-white">Admin Login</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>Login admin dengan Supabase Auth</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label style={labelStyle}>Email</label>
              <div className="flex items-center gap-3 px-3" style={{ ...inputStyle, padding: "0 12px", height: "46px" }}>
                <Mail className="h-4 w-4 shrink-0" style={{ color: "rgba(255,255,255,0.35)" }} />
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="admin@monza.com"
                  style={{ background: "none", border: "none", outline: "none", color: "white", width: "100%", fontSize: "14px", fontWeight: 600 }}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <div className="flex items-center gap-3 px-3" style={{ ...inputStyle, padding: "0 12px", height: "46px" }}>
                <Lock className="h-4 w-4 shrink-0" style={{ color: "rgba(255,255,255,0.35)" }} />
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Masukkan password"
                  style={{ background: "none", border: "none", outline: "none", color: "white", width: "100%", fontSize: "14px", fontWeight: 600 }}
                />
              </div>
            </div>
            {loginError && (
              <div className="px-3 py-3 text-sm font-bold" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5", borderRadius: "12px" }}>
                {loginError}
              </div>
            )}
            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full py-3 font-black text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)", borderRadius: "12px", boxShadow: "0 6px 20px rgba(124,58,237,0.35)", cursor: "pointer", fontFamily: "inherit" }}
            >
              {isAuthLoading ? "Loading..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
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
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>
            Logged in as: {userEmail}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2.5 font-black text-xs uppercase text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)", borderRadius: "12px", boxShadow: "0 4px 15px rgba(124,58,237,0.4)", cursor: "pointer", fontFamily: "inherit" }}
          >
            <Plus className="h-3.5 w-3.5" /> Add App
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2.5 font-black text-xs uppercase transition-all hover:opacity-90"
            style={{ background: "rgba(239,68,68,0.12)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "12px", cursor: "pointer", fontFamily: "inherit" }}
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
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

      {/* TABS */}
      <div
        className="flex gap-1 p-1"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px" }}
      >
        {(["apps", "users"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 text-xs font-black uppercase tracking-wider transition-all"
            style={{
              background: activeTab === tab ? "rgba(124,58,237,0.3)" : "none",
              color: activeTab === tab ? "#c4b5fd" : "rgba(255,255,255,0.35)",
              borderRadius: "8px",
              border: activeTab === tab ? "1px solid rgba(124,58,237,0.4)" : "1px solid transparent",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {tab === "apps" ? `Apps (${apps.length})` : `Users (${users.length})`}
          </button>
        ))}
      </div>

      {/* APPS TAB */}
      {activeTab === "apps" && (
        <div className="space-y-4">
          {/* Search */}
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

          {/* App list */}
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
              <div className="py-12 text-center text-sm font-bold" style={{ color: "rgba(255,255,255,0.2)" }}>No apps found</div>
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
                    <button onClick={() => toggleRecommended(app)} style={{ color: app.is_recommended ? "#fbbf24" : "rgba(255,255,255,0.2)", padding: "4px" }}>
                      <Star className="h-4 w-4" fill={app.is_recommended ? "currentColor" : "none"} />
                    </button>
                    <button onClick={() => openEdit(app)} style={{ color: "rgba(255,255,255,0.4)", padding: "4px" }}>
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteAppId(app.id)} style={{ color: "rgba(239,68,68,0.6)", padding: "4px" }}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Search */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px" }}
          >
            <Search className="h-4 w-4 shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
            <input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search users..."
              style={{ background: "none", border: "none", outline: "none", color: "white", fontFamily: "inherit", fontSize: "14px", width: "100%" }}
            />
          </div>

          {/* Stats users */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px" }}
          >
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" style={{ color: "#a78bfa" }} />
              <span className="text-xs font-black uppercase tracking-wider" style={{ color: "#a78bfa" }}>Total Users</span>
            </div>
            <span className="text-xl font-black text-white">{users.length}</span>
          </div>

          {/* User list */}
          <div style={{ ...cardStyle, overflow: "hidden" }}>
            <div className="px-4 py-3 flex justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-xs font-black uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>USER</span>
              <span className="text-xs font-black uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>ACTIONS</span>
            </div>

            {usersLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-4 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="w-10 h-10 rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.08)" }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.08)" }} />
                    <div className="h-3 w-48 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
                  </div>
                </div>
              ))
            ) : filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-sm font-bold" style={{ color: "rgba(255,255,255,0.2)" }}>
                {userSearch ? "No users match search" : "No users yet"}
              </div>
            ) : (
              filteredUsers.map((user, i) => (
                <div
                  key={user.id}
                  className="px-4 py-3 flex items-center gap-3 hover:bg-white/[0.03] transition-colors"
                  style={{ borderBottom: i < filteredUsers.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                >
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 shrink-0 flex items-center justify-center font-black text-sm"
                    style={{
                      background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(99,102,241,0.3))",
                      border: "1px solid rgba(124,58,237,0.3)",
                      borderRadius: "999px",
                      color: "#c4b5fd",
                    }}
                  >
                    {(user.username || user.email || "?")[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-white truncate">
                      {user.username || "No username"}
                    </p>
                    <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {user.email || "No email"}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.2)" }}>
                      Joined {user.created_at
                        ? new Date(user.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                        : "-"}
                    </p>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => { setEditingUser(user); setNewPassword(""); setIsPasswordModalOpen(true); }}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold transition-all hover:opacity-80"
                    style={{
                      background: "rgba(99,102,241,0.15)",
                      color: "#a5b4fc",
                      border: "1px solid rgba(99,102,241,0.25)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <Edit className="h-3 w-3" /> Edit
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* FORM MODAL - Add/Edit App */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto"
            style={{ background: "rgba(12,10,35,0.98)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px 20px 0 0", boxShadow: "0 -8px 40px rgba(0,0,0,0.6)" }}
          >
            <div
              className="flex items-center justify-between px-5 py-4 sticky top-0 z-10"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(12,10,35,0.99)", borderRadius: "20px 20px 0 0" }}
            >
              <div>
                <h2 className="font-black text-base text-white">{editingApp ? "Edit App" : "Add New App"}</h2>
                {editingApp && <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{editingApp.name}</p>}
              </div>
              <button onClick={() => setIsFormOpen(false)} style={{ color: "rgba(255,255,255,0.4)", padding: "4px" }}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Recommended toggle */}
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, is_recommended: !prev.is_recommended }))}
                className="w-full flex items-center gap-3 p-3 transition-all"
                style={{
                  background: form.is_recommended ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${form.is_recommended ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <div
                  className="w-5 h-5 flex items-center justify-center shrink-0"
                  style={{ background: form.is_recommended ? "#7c3aed" : "rgba(255,255,255,0.08)", borderRadius: "5px", border: form.is_recommended ? "none" : "1px solid rgba(255,255,255,0.2)" }}
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
                      <input name={name} value={(form as any)[name]} onChange={handleChange} placeholder={placeholder} style={inputStyle} />
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
                      {["Photography", "Video Editor", "Tools", "Social", "Productivity", "Games", "Education", "Entertainment"].map((c) => (
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
                    <label style={labelStyle}>Icon Color (hex)</label>
                    <input name="icon_color" value={form.icon_color} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Icon Initials</label>
                    <input name="icon_initials" value={form.icon_initials} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pb-2">
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-3 font-black text-sm transition-all"
                  style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)", borderRadius: "12px", cursor: "pointer", fontFamily: "inherit" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 py-3 font-black text-sm text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)", borderRadius: "12px", cursor: "pointer", fontFamily: "inherit" }}
                >
                  {editingApp ? <><Edit className="h-3.5 w-3.5" /> Update</> : <><Plus className="h-3.5 w-3.5" /> Add App</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* EDIT USER MODAL */}
      {isPasswordModalOpen && editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
            style={{ background: "rgba(12,10,35,0.98)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px 20px 0 0", boxShadow: "0 -8px 40px rgba(0,0,0,0.6)" }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div>
                <h2 className="font-black text-base text-white">Edit User</h2>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {editingUser.username || editingUser.email}
                </p>
              </div>
              <button onClick={() => setIsPasswordModalOpen(false)} style={{ color: "rgba(255,255,255,0.4)", padding: "4px" }}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* User info */}
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "14px" }}>
                <div className="space-y-3">
                  {[
                    { label: "Username", value: editingUser.username || "-" },
                    { label: "Email", value: editingUser.email || "-" },
                    { label: "User ID", value: editingUser.id, mono: true },
                    {
                      label: "Joined",
                      value: editingUser.created_at
                        ? new Date(editingUser.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                        : "-"
                    },
                  ].map((row) => (
                    <div key={row.label}>
                      <p className="text-[10px] font-bold uppercase mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{row.label}</p>
                      <p
                        className="text-sm font-bold text-white truncate"
                        style={row.mono ? { fontFamily: "monospace", fontSize: "11px", color: "rgba(255,255,255,0.6)" } : {}}
                      >
                        {row.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Role */}
<div>
  <label style={labelStyle}>Role</label>
  <select
    value={editingUser.role || "member"}
    onChange={async (e) => {
      const newRole = e.target.value;
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", editingUser.id);
      if (!error) {
        setEditingUser((u: any) => ({ ...u, role: newRole }));
        setUsers((prev) => prev.map((u) => u.id === editingUser.id ? { ...u, role: newRole } : u));
        toast({ title: "Role diupdate!" });
      }
    }}
    style={inputStyle}
  >
    <option value="member">Member</option>
    <option value="moderator">Moderator</option>
    <option value="admin">Admin</option>
  </select>
</div>

{/* VIP Toggle */}
<div>
  <label style={labelStyle}>VIP Status</label>
  <button
    type="button"
    onClick={async () => {
      const newVip = !editingUser.is_vip;
      const { error } = await supabase
        .from("profiles")
        .update({ is_vip: newVip })
        .eq("id", editingUser.id);
      if (!error) {
        setEditingUser((u: any) => ({ ...u, is_vip: newVip }));
        setUsers((prev) => prev.map((u) => u.id === editingUser.id ? { ...u, is_vip: newVip } : u));
        toast({ title: newVip ? "User dijadikan VIP!" : "VIP dinonaktifkan" });
      }
    }}
    className="w-full flex items-center gap-3 p-3 transition-all"
    style={{
      background: editingUser.is_vip ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${editingUser.is_vip ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.08)"}`,
      borderRadius: "12px",
      cursor: "pointer",
      fontFamily: "inherit",
    }}
  >
    <div
      className="w-5 h-5 flex items-center justify-center shrink-0"
      style={{
        background: editingUser.is_vip ? "#f59e0b" : "rgba(255,255,255,0.08)",
        borderRadius: "5px",
      }}
    >
      {editingUser.is_vip && <span className="text-white text-xs">✓</span>}
    </div>
    <span className="text-sm font-bold text-white">VIP Member</span>
  </button>
</div>

{/* VIP Expiry */}
<div>
  <label style={labelStyle}>VIP Berlaku Hingga (opsional)</label>
  <input
    type="date"
    value={editingUser.vip_expires_at ? editingUser.vip_expires_at.split("T")[0] : ""}
    onChange={async (e) => {
      const val = e.target.value ? new Date(e.target.value).toISOString() : null;
      const { error } = await supabase
        .from("profiles")
        .update({ vip_expires_at: val })
        .eq("id", editingUser.id);
      if (!error) {
        setEditingUser((u: any) => ({ ...u, vip_expires_at: val }));
        toast({ title: "Tanggal VIP diupdate!" });
      }
    }}
    style={{ ...inputStyle, colorScheme: "dark" }}
  />
</div>

{/* VIP Download URL */}
<div>
  <label style={labelStyle}>Link Download VIP</label>
  <input
    type="url"
    value={editingUser.vip_download_url || ""}
    onChange={(e) => setEditingUser((u: any) => ({ ...u, vip_download_url: e.target.value }))}
    placeholder="https://drive.google.com/..."
    style={inputStyle}
    onBlur={async (e) => {
      const { error } = await supabase
        .from("profiles")
        .update({ vip_download_url: e.target.value })
        .eq("id", editingUser.id);
      if (!error) {
        setUsers((prev) => prev.map((u) => u.id === editingUser.id ? { ...u, vip_download_url: e.target.value } : u));
        toast({ title: "Link VIP diupdate!" });
      }
    }}
  />
  <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>
    Link ini hanya bisa diakses oleh user VIP di halaman profile mereka
  </p>
</div>

              {/* New password */}
              <div>
                <label style={labelStyle}>Ganti Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  style={inputStyle}
                  onKeyDown={(e) => e.key === "Enter" && handleUpdatePassword()}
                />
                <p className="text-[11px] mt-1.5" style={{ color: "rgba(255,255,255,0.25)" }}>
                  ⚠️ Password lama akan langsung diganti setelah disimpan
                </p>
              </div>

              <div className="flex gap-3 pb-2">
                    <button
                  onClick={() => { setIsPasswordModalOpen(false); setNewPassword(""); }}
                  className="flex-1 py-3 font-black text-sm transition-all"
                  style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)", borderRadius: "12px", cursor: "pointer", fontFamily: "inherit" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePassword}
                  disabled={isSavingPassword || newPassword.length < 6}
                  className="flex-1 py-3 font-black text-sm text-white transition-all hover:opacity-90 disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)", borderRadius: "12px", cursor: "pointer", fontFamily: "inherit" }}
                >
                  {isSavingPassword ? "Saving..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE DIALOG */}
      <AlertDialog open={!!deleteAppId} onOpenChange={(open) => !open && setDeleteAppId(null)}>
        <AlertDialogContent
          className="p-0 overflow-hidden border-0 sm:max-w-sm"
          style={{ background: "rgba(12,10,35,0.98)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "20px" }}
        >
          <div className="p-5 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <AlertTriangle className="h-5 w-5" style={{ color: "#fca5a5" }} />
            <AlertDialogTitle className="text-base font-black text-white m-0">Delete App?</AlertDialogTitle>
          </div>
          <div className="p-5">
            <AlertDialogDescription className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.45)" }}>
              Yakin mau hapus app ini? Aksi ini tidak bisa dibatalkan.
            </AlertDialogDescription>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="font-bold text-xs border-0 flex-1"
                style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)", borderRadius: "10px" }}>
                Batal
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="font-bold text-xs border-0 flex-1"
                style={{ background: "rgba(239,68,68,0.25)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.35)", borderRadius: "10px" }}>
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
