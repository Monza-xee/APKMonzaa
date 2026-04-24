import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useLocation } from "wouter";
import { User, Mail, LogOut, Edit2, Check, X, Shield, Calendar } from "lucide-react";

export function Profile() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

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
      setMessage("Username sudah dipakai atau terjadi error.");
    } else {
      setProfile((p: any) => ({ ...p, username: newUsername.trim() }));
      setEditingUsername(false);
      setMessage("Username berhasil diupdate!");
      setTimeout(() => setMessage(""), 3000);
    }
    setIsSaving(false);
  }

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    color: "white",
    fontFamily: "inherit",
    fontSize: "14px",
    fontWeight: "600",
    padding: "8px 12px",
    outline: "none",
    flex: 1,
  };

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
    overflow: "hidden",
  };

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
      <div
        className="flex flex-col items-center py-8 px-4 text-center"
        style={cardStyle}
      >
        <div
          className="w-20 h-20 flex items-center justify-center mb-4"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #6366f1)",
            borderRadius: "999px",
            border: "3px solid rgba(124,58,237,0.3)",
          }}
        >
          <User className="h-9 w-9 text-white" />
        </div>
        <p className="font-black text-xl text-white">
          {profile?.username || "User"}
        </p>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
          {user?.email}
        </p>
        <div
          className="flex items-center gap-1.5 mt-3 px-3 py-1"
          style={{
            background: "rgba(34,197,94,0.15)",
            border: "1px solid rgba(34,197,94,0.3)",
            borderRadius: "999px",
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#86efac" }} />
          <span className="text-xs font-bold" style={{ color: "#86efac" }}>Active</span>
        </div>
      </div>

      {/* ACCOUNT INFO */}
      <div style={cardStyle}>
        <div
          className="px-4 py-3 flex items-center gap-2"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <User className="h-4 w-4" style={{ color: "#a78bfa" }} />
          <span className="text-xs font-black uppercase tracking-wider" style={{ color: "#a78bfa" }}>
            Account Info
          </span>
        </div>

        {/* Username */}
        <div
          className="px-4 py-3 flex items-center justify-between gap-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>
              Username
            </p>
            {editingUsername ? (
              <div className="flex items-center gap-2">
                <input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  style={inputStyle}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveUsername();
                    if (e.key === "Escape") setEditingUsername(false);
                  }}
                />
                <button
                  onClick={handleSaveUsername}
                  disabled={isSaving}
                  style={{ color: "#86efac", padding: "4px", background: "none", cursor: "pointer" }}
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => { setEditingUsername(false); setNewUsername(profile?.username || ""); }}
                  style={{ color: "#fca5a5", padding: "4px", background: "none", cursor: "pointer" }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <p className="text-sm font-bold text-white">{profile?.username || "-"}</p>
            )}
          </div>
          {!editingUsername && (
            <button
              onClick={() => setEditingUsername(true)}
              style={{ color: "rgba(255,255,255,0.3)", padding: "4px", background: "none", cursor: "pointer" }}
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Email */}
        <div
          className="px-4 py-3 flex items-center gap-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <Mail className="h-4 w-4 shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
          <div>
            <p className="text-xs font-bold uppercase mb-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              Email
            </p>
            <p className="text-sm font-bold text-white">{user?.email}</p>
          </div>
        </div>

        {/* Member since */}
        <div className="px-4 py-3 flex items-center gap-3">
          <Calendar className="h-4 w-4 shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
          <div>
            <p className="text-xs font-bold uppercase mb-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              Member Since
            </p>
            <p className="text-sm font-bold text-white">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString("id-ID", {
                    day: "numeric", month: "long", year: "numeric",
                  })
                : "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className="px-4 py-3 text-xs font-bold rounded-xl"
          style={{
            background: message.includes("error") || message.includes("dipakai")
              ? "rgba(239,68,68,0.15)"
              : "rgba(34,197,94,0.15)",
            color: message.includes("error") || message.includes("dipakai") ? "#fca5a5" : "#86efac",
            border: `1px solid ${message.includes("error") || message.includes("dipakai") ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
          }}
        >
          {message}
        </div>
      )}

      {/* SECURITY */}
      <div style={cardStyle}>
        <div
          className="px-4 py-3 flex items-center gap-2"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Shield className="h-4 w-4" style={{ color: "#a78bfa" }} />
          <span className="text-xs font-black uppercase tracking-wider" style={{ color: "#a78bfa" }}>
            Security
          </span>
        </div>
        <div className="p-4">
          <button
            onClick={async () => {
              const { error } = await supabase.auth.resetPasswordForEmail(user.email);
              if (!error) setMessage("Link reset password dikirim ke email kamu.");
            }}
            className="w-full py-3 text-sm font-bold transition-all hover:opacity-80"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.6)",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Ubah Password
          </button>
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
