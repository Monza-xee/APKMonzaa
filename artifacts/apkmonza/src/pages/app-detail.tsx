import { useRoute, Link } from "wouter";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { CalendarClock, ChevronLeft, Download, HardDrive, Info, Package, Server, Tags, User, Wifi, Zap, Crown, Lock } from "lucide-react";

const categoryColors: Record<string, { bg: string; color: string; border: string }> = {
  Photography: { bg: "rgba(236,72,153,0.15)", color: "#f9a8d4", border: "rgba(236,72,153,0.3)" },
  "Video Editor": { bg: "rgba(124,58,237,0.15)", color: "#c4b5fd", border: "rgba(124,58,237,0.3)" },
  Tools: { bg: "rgba(20,184,166,0.15)", color: "#5eead4", border: "rgba(20,184,166,0.3)" },
  Social: { bg: "rgba(59,130,246,0.15)", color: "#93c5fd", border: "rgba(59,130,246,0.3)" },
  Productivity: { bg: "rgba(16,185,129,0.15)", color: "#6ee7b7", border: "rgba(16,185,129,0.3)" },
  Games: { bg: "rgba(245,158,11,0.15)", color: "#fcd34d", border: "rgba(245,158,11,0.3)" },
  Education: { bg: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "rgba(99,102,241,0.3)" },
  Entertainment: { bg: "rgba(239,68,68,0.15)", color: "#fca5a5", border: "rgba(239,68,68,0.3)" },
};

function getCategoryStyle(cat: string) {
  return categoryColors[cat] || { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "rgba(255,255,255,0.12)" };
}

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "16px",
  overflow: "hidden",
};

export function AppDetail() {
  const [, params] = useRoute("/app/:id");
  const id = params?.id || "";
  const [app, setApp] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchApp() {
      if (!id) return;
      const { data, error } = await supabase
        .from("ListAPKGAMES")
        .select("*")
        .eq("id", id)
        .single();
      if (!error) setApp(data);
      setIsLoading(false);
    }
    fetchApp();
  }, [id]);

  useEffect(() => {
    async function fetchUserProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("is_vip, vip_expires_at, role")
        .eq("id", user.id)
        .single();
      setUserProfile(data);
    }
    fetchUserProfile();
  }, []);

  const isVip = userProfile?.is_vip && (
    !userProfile?.vip_expires_at ||
    new Date(userProfile.vip_expires_at) > new Date()
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse"
            style={{
              height: i === 1 ? "28px" : i === 2 ? "180px" : "140px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "16px",
              width: i === 1 ? "180px" : "100%",
            }}
          />
        ))}
      </div>
    );
  }

  if (!app) {
    return (
      <div className="p-12 text-center" style={cardStyle}>
        <h2 className="text-xl font-black mb-4 text-white">App Not Found</h2>
        <Link href="/">
          <span
            className="inline-block font-bold text-xs uppercase px-5 py-2.5 text-white cursor-pointer"
            style={{ background: "rgba(124,58,237,0.3)", borderRadius: "999px", border: "1px solid rgba(124,58,237,0.5)" }}
          >
            Return to Catalog
          </span>
        </Link>
      </div>
    );
  }

  const statusOnline = app.status === "ONLINE";
  const catStyle = getCategoryStyle(app.category);

  // Tentukan link download berdasarkan VIP
  const downloadLink = isVip
    ? app.download_url
    : (app.download_url_free || app.download_url);

  return (
    <div className="space-y-4">

      {/* BREADCRUMB */}
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide flex-wrap">
        <Link href="/">
          <span className="flex items-center gap-1 cursor-pointer hover:opacity-80" style={{ color: "rgba(255,255,255,0.4)" }}>
            <ChevronLeft className="h-3 w-3" /> CATALOG
          </span>
        </Link>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>
        <span style={{ color: "rgba(255,255,255,0.4)" }}>{app.category}</span>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>
        <span className="text-white truncate max-w-[140px]">{app.name?.toUpperCase()}</span>
      </div>

      {/* HERO */}
      <div className="relative overflow-hidden" style={{ borderRadius: "16px" }}>
        {app.icon_url && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${app.icon_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(8px) brightness(0.55)",
              transform: "scale(1.15)",
            }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: app.icon_url
              ? "rgba(10,8,30,0.3)"
              : `linear-gradient(135deg, ${app.icon_color || "#7c3aed"}44, rgba(10,8,30,0.7))`,
          }}
        />
        {!app.icon_url && (
          <div className="absolute inset-0" style={{ backgroundColor: app.icon_color || "#7c3aed", opacity: 0.25 }} />
        )}

        <div className="relative z-10 p-5 flex gap-4 items-center">
          <div
            className="w-20 h-20 shrink-0 overflow-hidden flex items-center justify-center font-black text-2xl"
            style={{ borderRadius: "18px", backgroundColor: app.icon_color || "#7c3aed", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            {app.icon_url ? (
              <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white">{app.icon_initials || "AP"}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-white leading-tight">{app.name}</h1>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <span
                className="text-[11px] font-bold px-2.5 py-1 flex items-center gap-1"
                style={{
                  background: statusOnline ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
                  color: statusOnline ? "#86efac" : "#fca5a5",
                  border: `1px solid ${statusOnline ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"}`,
                  borderRadius: "999px",
                }}
              >
                <Wifi className="h-2.5 w-2.5" /> {app.status}
              </span>
              <span
                className="text-[11px] font-bold px-2.5 py-1"
                style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.75)", borderRadius: "999px" }}
              >
                {app.type}
              </span>
              {app.category && (
                <span
                  className="text-[11px] font-bold px-2.5 py-1"
                  style={{ background: catStyle.bg, color: catStyle.color, border: `1px solid ${catStyle.border}`, borderRadius: "999px" }}
                >
                  {app.category}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DEVELOPER */}
      <div style={cardStyle}>
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <User className="h-4 w-4" style={{ color: "#a78bfa" }} />
          <span className="text-xs font-black uppercase tracking-wider" style={{ color: "#a78bfa" }}>Developer</span>
        </div>
        <div className="p-4 flex items-center gap-3">
          <div
            className="w-10 h-10 flex items-center justify-center shrink-0"
            style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: "10px" }}
          >
            <User className="h-5 w-5" style={{ color: "#c4b5fd" }} />
          </div>
          <div>
            <p className="font-black text-sm text-white">{app.developer || "Unknown Developer"}</p>
            {app.developer_url ? (
              <a href={app.developer_url} target="_blank" rel="noopener noreferrer"
                className="text-xs hover:opacity-80" style={{ color: "#a78bfa" }}>
                {app.developer_url}
              </a>
            ) : (
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>No developer info</p>
            )}
          </div>
        </div>
      </div>

      {/* MOD FEATURES */}
      <div style={cardStyle}>
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Zap className="h-4 w-4" style={{ color: "#a78bfa" }} />
          <span className="text-xs font-black uppercase tracking-wider" style={{ color: "#a78bfa" }}>Mod Features</span>
        </div>
        <div className="p-4 text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "inherit" }}>
          {app.mod_features_full || "No mod features specified."}
        </div>
      </div>

      {/* DESCRIPTION */}
      <div style={cardStyle}>
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Info className="h-4 w-4" style={{ color: "#a78bfa" }} />
          <span className="text-xs font-black uppercase tracking-wider" style={{ color: "#a78bfa" }}>Description</span>
        </div>
        <div className="p-4 text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "rgba(255,255,255,0.55)" }}>
          {app.description || "No description available."}
        </div>
      </div>

      {/* TECH SPECS */}
      <div style={cardStyle}>
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Server className="h-4 w-4" style={{ color: "#a78bfa" }} />
          <span className="text-xs font-black uppercase tracking-wider" style={{ color: "#a78bfa" }}>Tech Specs</span>
        </div>
        {[
          { icon: <Tags className="h-3.5 w-3.5" />, label: "VERSION", value: app.version },
          { icon: <HardDrive className="h-3.5 w-3.5" />, label: "SIZE", value: app.size },
          { icon: <Package className="h-3.5 w-3.5" />, label: "PACKAGE", value: app.package_name },
          {
            icon: <CalendarClock className="h-3.5 w-3.5" />,
            label: "UPDATED",
            value: app.uploaded_at
              ? new Date(app.uploaded_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
              : "-",
          },
        ].map((row, i, arr) => (
          <div
            key={i}
            className="px-4 py-3 flex justify-between items-center gap-4"
            style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
          >
            <dt className="flex items-center gap-2 text-xs font-black uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
              <span style={{ color: "#a78bfa" }}>{row.icon}</span> {row.label}
            </dt>
            <dd className="text-xs font-bold text-right break-all" style={{ color: "rgba(255,255,255,0.75)" }}>
              {row.value}
            </dd>
          </div>
        ))}
      </div>

      {/* DOWNLOAD - DUAL TIER */}
<div style={cardStyle}>
  <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
    <div className="flex items-center gap-2">
      <Download className="h-4 w-4" style={{ color: "#a78bfa" }} />
      <span className="text-xs font-black uppercase tracking-wider" style={{ color: "#a78bfa" }}>
        Link Download
      </span>
    </div>
    {isVip && (
      <div
        className="flex items-center gap-1 px-2 py-0.5"
        style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "999px" }}
      >
        <Crown className="h-3 w-3" style={{ color: "#fcd34d" }} />
        <span className="text-[10px] font-bold" style={{ color: "#fcd34d" }}>VIP ACTIVE</span>
      </div>
    )}
  </div>

  <div className="p-4 space-y-3">
    {/* VIP TIER BUTTON */}
    {app.download_url ? (
      isVip ? (
        <a href={app.download_url} target="_blank" rel="noopener noreferrer">
          <button
            className="w-full font-black text-sm uppercase text-white py-4 flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(245,158,11,0.4)",
            }}
          >
            <Crown className="h-4 w-4" />
            VIP DIRECT DOWNLOAD ({app.size})
          </button>
        </a>
      ) : (
        <div className="relative group">
          <button
            disabled
            className="w-full font-black text-sm uppercase py-4 flex items-center justify-center gap-2 cursor-not-allowed relative overflow-hidden"
            style={{
              background: "rgba(245,158,11,0.08)",
              color: "rgba(245,158,11,0.4)",
              borderRadius: "12px",
              border: "1px solid rgba(245,158,11,0.15)",
            }}
          >
            <Lock className="h-4 w-4" />
            VIP DIRECT DOWNLOAD
          </button>
          {/* Upsell overlay untuk non-VIP */}
          {!userProfile ? (
            <Link href="/auth">
              <div
                className="absolute inset-0 flex items-center justify-center gap-2 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: "rgba(245,158,11,0.9)",
                  borderRadius: "12px",
                }}
              >
                <Crown className="h-4 w-4 text-white" />
                <span className="text-xs font-black text-white uppercase">Login untuk Upgrade VIP</span>
              </div>
            </Link>
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{
                background: "rgba(245,158,11,0.9)",
                borderRadius: "12px",
              }}
            >
              <Crown className="h-4 w-4 text-white" />
              <span className="text-xs font-black text-white uppercase">Upgrade ke VIP untuk Unlock</span>
            </div>
          )}
        </div>
      )
    ) : null}

    {/* FREE TIER BUTTON */}
    {app.download_url_free || app.download_url ? (
      <a
        href={app.download_url_free || app.download_url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <button
          className="w-full font-black text-sm uppercase py-4 flex items-center justify-center gap-2 transition-all hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #6366f1)",
            color: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
          }}
        >
          <Download className="h-4 w-4" />
          FREE DOWNLOAD ({app.size})
        </button>
      </a>
    ) : (
      <button
        disabled
        className="w-full font-black text-sm uppercase py-4 cursor-not-allowed"
        style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.2)", borderRadius: "12px" }}
      >
        No Download Link Available
      </button>
    )}

    {/* Info banner */}
    {!isVip && (
      <div
        className="flex items-start gap-2 px-4 py-3"
        style={{
          background: "rgba(245,158,11,0.06)",
          border: "1px solid rgba(245,158,11,0.15)",
          borderRadius: "10px",
        }}
      >
        <Zap className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: "rgba(245,158,11,0.6)" }} />
        <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
          User <span style={{ color: "#fcd34d", fontWeight: 700 }}>VIP</span> mendapat akses 
          <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600 }}> Direct Download</span> tanpa redirect, iklan, atau waiting timer.
        </p>
      </div>
    )}

    {/* Login prompt */}
    {!userProfile && (app.download_url || app.download_url_free) && (
      <Link href="/auth">
        <div
          className="flex items-center justify-center gap-2 py-2.5 cursor-pointer transition-all hover:opacity-80"
          style={{
            background: "rgba(124,58,237,0.1)",
            border: "1px solid rgba(124,58,237,0.2)",
            borderRadius: "10px",
          }}
        >
          <User className="h-3.5 w-3.5" style={{ color: "#a78bfa" }} />
          <p className="text-xs font-bold" style={{ color: "#a78bfa" }}>
            Login untuk mengakses semua fitur
          </p>
        </div>
      </Link>
    )}
  </div>
</div>
