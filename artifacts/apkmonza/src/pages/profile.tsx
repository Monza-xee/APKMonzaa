import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useLocation } from "wouter";
import { User, Mail, LogOut, Edit2, Check, X, Shield, Calendar, Crown, Star, Eye, EyeOff } from "lucide-react";

export function Profile() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "success" });

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLocation("/auth"); return; }
      setUser(user);
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(data);
      setNewUsername(data?.username || "");
      setIsLoading(false);
    }
    loadProfile();
  }, []);

  function showMsg(text: string, type: "success" | "error" = "success") {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setLocation("/");
  }

  async function handleSaveUsername() {
    if (!newUsername.trim()) return;
    setIsSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ username: newUsername.trim() })
      .eq("id", user.id);
    if (error) {
      showMsg("Username sudah dipakai atau terjadi error.", "error");
    } else {
      setProfile((p: any) => ({ ...p, username: newUsername.trim() }));
      setEditingUsername(false);
      showMsg("Username berhasil diupdate!");
    }
    setIsSaving(false);
  }

  async function handleChangePassword() {
    if (!newPassword || newPassword.length < 6) {
      showMsg("Password baru minimal 6 karakter.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showMsg("Konfirmasi password tidak cocok.", "error");
      return;
    }
    setIsChangingPassword(true);

    // Re-auth dulu dengan password lama
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      showMsg("Password lama salah.", "error");
      setIsChangingPassword(false);
      return;
    }

    // Update password baru
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      showMsg("Gagal update password: " + error.message, "error");
    } else {
      showMsg("Password berhasil diupdate!");
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setIsChangingPassword(false);
  }

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    color: "white",
    fontFamily: "inherit",
    fontSize: "14px",
    fontWeight: "600",
    padding: "10px 14px",
    outline: "none",
    width: "100%",
  };

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
    overflow: "hidden",
  };

  // Role badge config
  const roleConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
    admin: { label: "Admin", color: "#fca5a5", bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.3)", icon: Shield },
    moderator: { label: "Moderator", color: "#93c5fd", bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.3)", icon: Star },
    member: { label: "Member", color: "#a78bfa", bg: "rgba(124,58,237,0.15)", border: "rgba(124,58,237,0.3)", icon: User },
  };

  const role = profile?.role || "member";
  const roleCfg = roleConfig[role] || roleConfig.member;
  const RoleIcon = roleCfg.icon;

  const isVip = profile?.is_vip && (
    !profile?.vip_expires_at || new Date(profile.vip_expires_at) > new Date()
  );

  const vipExpiry = profile?.vip_expires_at
    ? new Date(profile.vip_expires_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : null;

  if (isLoading) {
    return (
      <div className="space-y-4 pb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl"
            style={{ background: "rgba(255,255,255,0.05)" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8 pt-1">

      {/* AVATAR + NAME */}
      <div className="flex flex-col items-center py-8 px-4 text-center" style={cardStyle}>
        {/* Avatar with VIP ring */}
        <div className="relative mb-4">
          <div
            className="w-20 h-20 flex items-center justify-center"
            style={{
              background: isVip
                ? "linear-gradient(135deg, #f59e0b, #d97706)"
                : "linear-gradient(135deg, #7c3aed, #6366f1)",
              borderRadius: "999px",
              border: isVip
                ? "3px solid rgba(245,158,11,0.5)"
                : "3px solid rgba(124,58,237,0.3)",
              boxShadow: isVip ? "0 0 20px rgba(245,158,11,0.3)" : "none",
            }}
          >
            {isVip
              ? <Crown className="h-9 w-9 text-white" />
              : <User className="h-9 w-9 text-white" />
            }
          </div>
          {isVip && (
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 flex items-center justify-center"
              style={{ background: "#f59e0b", borderRadius: "999px", border: "2px solid rgba(10,8,30,1)" }}
            >
              <Crown className="h-3 w-3 text-white" />
            </div>
          )}
        </div>

        <p className="font-black text-xl text-white">{profile?.username || "User"}</p>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>{user?.email}</p>

        {/* Badges */}
        <div className="flex gap-2 mt-3 flex-wrap justify-center">
          {/* Role badge */}
          <div
            className="flex items-center gap-1.5 px-3 py-1"
            style={{ background: roleCfg.bg, border: `1px solid ${roleCfg.border}`, borderRadius: "999px" }}
          >
            <RoleIcon className="h-3 w-3" style={{ color: roleCfg.color }} />
            <span className="text-xs font-bold" style={{ color: roleCfg.color }}>{roleCfg.label}</span>
          </div>

          {/* VIP badge */}
          {isVip && (
            <div
              className="flex items-center gap-1.5 px-3 py-1"
              style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.35)", borderRadius: "999px" }}
            >
              <Crown className="h-3 w-3" style={{ color: "#fcd34d" }} />
              <span className="text-xs font-bold" style={{ color: "#fcd34d" }}>VIP</span>
            </div>
          )}
        </div>
      </div>

      {/* VIP CARD */}
      {isVip && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.1))",
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(245,158,11,0.15)" }}>
            <Crown className="h-4 w-4" style={{ color: "#fcd34d" }} />
            <span className="text-xs font-black uppercase tracking-wider" style={{ color: "#fcd34d" }}>
              VIP Membership
            </span>
          </div>
          <div className="p-4 space-y-3">
            {vipExpiry && (
              <div>
                <p className="text-[10px] font-bold uppercase mb-0.5" style={{ color: "rgba(245,158,11,0.6)" }}>Berlaku hingga</p>
                <p className="text-sm font-bold text-white">{vipExpiry}</p>
              </div>
            )}
            {profile?.vip_download_url && (
              <div>
                <p className="text-[10px] font-bold uppercase mb-1.5" style={{ color: "rgba(245,158,11,0.6)" }}>
                  Link Download VIP
                </p>
                <a
                  href={profile.vip_download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 font-black text-sm transition-all hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    color: "white",
                    borderRadius: "12px",
                    boxShadow: "0 4px 15px rgba(245,158,11,0.3)",
                    textDecoration: "none",
                  }}
                >
                  <Crown className="h-4 w-4" />
                  Akses Download VIP
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NOT VIP — upgrade prompt */}
      {!isVip && (
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px dashed rgba(255,255,255,0.1)",
            borderRadius: "16px",
            padding: "16px",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Crown className="h-4 w-4" style={{ color: "rgba(255,255,255,0.3)" }} />
            <p className="text-sm font-black text-white">Upgrade ke VIP</p>
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            Dapatkan akses link download eksklusif dan fitur premium lainnya.
          </p>
        </div>
      )}

      {/* ACCOUNT INFO */}
      <div style={cardStyle}>
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <User className="h-4 w-4" style={{ color: "#a78bfa" }} />
          <span className="text-xs font-black uppercase tracking-wider" style={{ color: "#a78bfa" }}>Account Info</span>
        </div>

        {/* Username */}
        <div className="px-4 py-3 flex items-center justify-between gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>Username</p>
            {editingUsername ? (
              <div className="flex items-center gap-2">
                <input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  style={{ ...inputStyle, padding: "8px 12px", flex: 1, width: "auto" }}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveUsername();
                    if (e.key === "Escape") setEditingUsername(false);
                  }}
                />
                <button onClick={handleSaveUsername} disabled={isSaving}
                  style={{ color: "#86efac", padding: "4px", background: "none", cursor: "pointer" }}>
                  <Check className="h-4 w-4" />
                </button>
                <button onClick={() => { setEditingUsername(false); setNewUsername(profile?.username || ""); }}
                  style={{ color: "#fca5a5", padding: "4px", background: "none", cursor: "pointer" }}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <p className="text-sm font-bold text-white">{profile?.username || "-"}</p>
            )}
          </div>
          {!editingUsername && (
            <button onClick={() => setEditingUsername(true)}
              style={{ color: "rgba(255,255,255,0.3)", padding: "4px", background: "none", cursor: "pointer" }}>
              <Edit2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Email */}
        <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <Mail className="h-4 w-4 shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
          <div>
            <p className="text-xs font-bold uppercase mb-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Email</p>
            <p className="text-sm font-bold text-white">{user?.email}</p>
          </div>
        </div>

        {/* Role */}
        <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <RoleIcon className="h-4 w-4 shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
          <div>
            <p className="text-xs font-bold uppercase mb-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Role</p>
            <span
              className="text-xs font-bold px-2 py-0.5"
              style={{ background: roleCfg.bg, color: roleCfg.color, border: `1px solid ${roleCfg.border}`, borderRadius: "999px" }}
            >
              {roleCfg.label}
            </span>
          </div>
        </div>

        {/* Member since */}
        <div className="px-4 py-3 flex items-center gap-3">
          <Calendar className="h-4 w-4 shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
          <div>
            <p className="text-xs font-bold uppercase mb-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Member Since</p>
            <p className="text-sm font-bold text-white">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                : "-"}
            </p>
          </div>
        </div>
      </div>

      {/* MESSAGE */}
      {message.text && (
        <div
          className="px-4 py-3 text-xs font-bold rounded-xl"
          style={{
            background: message.type === "error" ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
            color: message.type === "error" ? "#fca5a5" : "#86efac",
            border: `1px solid ${message.type === "error" ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
          }}
        >
          {message.text}
        </div>
      )}

      {/* SECURITY */}
      <div style={cardStyle}>
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Shield className="h-4 w-4" style={{ color: "#a78bfa" }} />
          <span className="text-xs font-black uppercase tracking-wider" style={{ color: "#a78bfa" }}>Security</span>
        </div>
        <div className="p-4 space-y-3">
          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="w-full py-3 text-sm font-bold transition-all hover:opacity-80"
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.7)",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.08)",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Ubah Password
            </button>
          ) : (
            <div className="space-y-3">
              {/* Current password */}
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Password Lama
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ ...inputStyle, paddingRight: "40px" }}
                  />
                  <button
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "rgba(255,255,255,0.3)", background: "none", cursor: "pointer" }}
                  >
                    {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 karakter"
                    style={{ ...inputStyle, paddingRight: "40px" }}
                  />
                  <button
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "rgba(255,255,255,0.3)", background: "none", cursor: "pointer" }}
                  >
                    {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  style={inputStyle}
                  onKeyDown={(e) => e.key === "Enter" && handleChangePassword()}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="flex-1 py-2.5 text-sm font-bold transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.5)",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                  className="flex-1 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {isChangingPassword ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="w-full py-3.5 font-black text-sm uppercase flex items-center justify-center gap-2 transition-all hover:opacity-80"
        style={{
          background: "rgba(239,68,68,0.15)",
          color: "#fca5a5",
          border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: "14px",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>

    </div>
  );
}