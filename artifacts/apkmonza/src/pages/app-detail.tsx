import { useRoute, Link } from "wouter";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { CalendarClock, ChevronLeft, Download, HardDrive, Info, Package, Server, Tags, User, Zap } from "lucide-react";

export function AppDetail() {
  const [, params] = useRoute("/app/:id");
  const id = params?.id || "";

  const [app, setApp] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse"
            style={{
              height: i === 1 ? "32px" : i === 2 ? "260px" : "180px",
              background: "rgba(255,255,255,0.07)",
              borderRadius: "16px",
              width: i === 1 ? "200px" : "100%",
            }}
          />
        ))}
      </div>
    );
  }

  if (!app) {
    return (
      <div
        className="p-12 text-center max-w-md mx-auto mt-12"
        style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "20px",
        }}
      >
        <h2 className="text-2xl font-black mb-6 uppercase text-white">App Not Found</h2>
        <Link href="/">
          <span
            className="inline-block font-black text-xs uppercase px-6 py-3 text-white cursor-pointer transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #6366f1)",
              borderRadius: "12px",
              boxShadow: "0 4px 15px rgba(124,58,237,0.4)",
            }}
          >
            Return to Catalog
          </span>
        </Link>
      </div>
    );
  }

  const statusOnline = app.status === "ONLINE";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
        <Link href="/">
          <span className="flex items-center gap-1 cursor-pointer transition-all hover:opacity-80" style={{ color: "#a78bfa" }}>
            <ChevronLeft className="h-3.5 w-3.5" /> Catalog
          </span>
        </Link>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>
        <span style={{ color: "rgba(255,255,255,0.4)" }}>{app.category}</span>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>
        <span style={{ color: "rgba(255,255,255,0.8)" }}>{app.name}</span>
      </div>

      {/* HERO CARD */}
      <div
        className="overflow-hidden relative"
        style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "20px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <div
          className="absolute top-0 left-0 w-full h-28"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.5), rgba(99,102,241,0.3))",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        />
        <div className="relative z-10 pt-14 px-6 pb-6 md:px-10 md:pb-10 flex flex-col md:flex-row gap-6 items-start">
          <div
            className="w-28 h-28 md:w-40 md:h-40 shrink-0 flex items-center justify-center font-black text-4xl md:text-6xl overflow-hidden"
            style={{
              backgroundColor: app.icon_color || "#7c3aed",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            {app.icon_url ? (
              <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white">{app.icon_initials || "AP"}</span>
            )}
          </div>
          <div className="flex-1 mt-2 md:mt-16">
            <h1 className="text-3xl md:text-5xl font-black uppercase leading-none mb-4" style={{ color: "rgba(255,255,255,0.95)" }}>
              {app.name}
            </h1>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  text: app.status,
                  bg: statusOnline ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
                  color: statusOnline ? "#86efac" : "#fca5a5",
                  border: statusOnline ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)",
                },
                {
                  text: app.type,
                  bg: "rgba(124,58,237,0.3)",
                  color: "#c4b5fd",
                  border: "rgba(124,58,237,0.4)",
                },
                {
                  text: app.category,
                  bg: "rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.6)",
                  border: "rgba(255,255,255,0.12)",
                },
              ].map((badge, i) => (
                <span
                  key={i}
                  className="text-xs font-black uppercase px-3 py-1"
                  style={{
                    background: badge.bg,
                    color: badge.color,
                    border: `1px solid ${badge.border}`,
                    borderRadius: "999px",
                  }}
                >
                  {badge.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BODY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="md:col-span-2 space-y-6">

          {/* DEVELOPER BOX */}
          <section
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <div
              className="px-6 py-4 flex items-center gap-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <User className="h-5 w-5" style={{ color: "rgba(255,255,255,0.5)" }} />
              <h2 className="text-base font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.8)" }}>
                Developer
              </h2>
            </div>
            <div className="p-6 flex items-center gap-4">
              <div
                className="w-12 h-12 flex items-center justify-center shrink-0"
                style={{
                  background: "rgba(124,58,237,0.2)",
                  border: "1px solid rgba(124,58,237,0.3)",
                  borderRadius: "12px",
                }}
              >
                <User className="h-6 w-6" style={{ color: "#c4b5fd" }} />
              </div>
              <div>
                <p className="font-black text-sm uppercase tracking-wide text-white">
                  {app.developer || "UNKNOWN DEVELOPER"}
                </p>
                {app.developer_url && (
                  <a
                    href={app.developer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold transition-all hover:opacity-80"
                    style={{ color: "#a78bfa" }}
                  >
                    {app.developer_url}
                  </a>
                )}
                {!app.developer_url && (
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                    No developer info available
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* MOD FEATURES */}
<section
  style={{
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "16px",
    overflow: "hidden",
  }}
>
  <div
    className="px-6 py-4 flex items-center gap-3"
    style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
  >
    <Zap className="h-5 w-5" style={{ color: "rgba(255,255,255,0.5)" }} />
    <h2 className="text-base font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.8)" }}>
      Mod Features
    </h2>
  </div>
  <div
    className="p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap"
    style={{ color: "rgba(255,255,255,0.75)" }}
  >
    {app.mod_features_full || "NO MOD FEATURES SPECIFIED."}
  </div>
</section>

          {/* DESCRIPTION */}
          <section
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <div
              className="px-6 py-4 flex items-center gap-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <Info className="h-5 w-5" style={{ color: "rgba(255,255,255,0.5)" }} />
              <h2 className="text-base font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.8)" }}>
                Description
              </h2>
            </div>
            <div className="p-6 text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "rgba(255,255,255,0.5)" }}>
              {app.description || "NO DESCRIPTION AVAILABLE."}
            </div>
          </section>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          {/* TECH SPECS */}
          <section
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <div
              className="px-5 py-4 flex items-center gap-2"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <Server className="h-4 w-4" style={{ color: "rgba(255,255,255,0.5)" }} />
              <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.8)" }}>
                Tech Specs
              </h2>
            </div>
            <dl className="font-mono text-xs">
              {[
                { icon: <Tags className="h-3.5 w-3.5" />, label: "Version", value: app.version },
                { icon: <HardDrive className="h-3.5 w-3.5" />, label: "Size", value: app.size },
                { icon: <Package className="h-3.5 w-3.5" />, label: "Package", value: app.package_name },
                {
                  icon: <CalendarClock className="h-3.5 w-3.5" />,
                  label: "Updated",
                  value: app.uploaded_at
                    ? new Date(app.uploaded_at).toLocaleDateString("id-ID", {
                        day: "numeric", month: "short", year: "numeric",
                      })
                    : "-",
                },
              ].map((row, i, arr) => (
                <div
                  key={i}
                  className="px-5 py-3.5 flex justify-between items-center gap-4"
                  style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}
                >
                  <dt className="font-black uppercase flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {row.icon} {row.label}
                  </dt>
                  <dd className="text-right break-all font-bold" style={{ color: "rgba(255,255,255,0.75)" }}>
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* DOWNLOAD */}
          <section
            style={{
              background: "rgba(124,58,237,0.15)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(124,58,237,0.3)",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <div
              className="px-5 py-4 flex items-center gap-2"
              style={{ borderBottom: "1px solid rgba(124,58,237,0.2)" }}
            >
              <Download className="h-4 w-4" style={{ color: "#c4b5fd" }} />
              <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: "#c4b5fd" }}>
                Link Download
              </h2>
            </div>
            <div className="p-5">
              {app.download_url ? (
                <a href={app.download_url} target="_blank" rel="noopener noreferrer">
                  <button
                    className="w-full font-black text-sm uppercase text-white py-4 transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                      borderRadius: "12px",
                      boxShadow: "0 4px 20px rgba(124,58,237,0.5)",
                    }}
                  >
                    Download APK ({app.size})
                  </button>
                </a>
              ) : (
                <button
                  disabled
                  className="w-full font-black text-sm uppercase py-4 cursor-not-allowed"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.25)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  No Download Link
                </button>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
                    }
