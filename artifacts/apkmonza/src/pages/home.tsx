import { useState, useEffect } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";
import { Search, Gamepad2, Smartphone, Wifi, Calendar } from "lucide-react";

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
  return (
    categoryColors[cat] || {
      bg: "rgba(255,255,255,0.08)",
      color: "rgba(255,255,255,0.6)",
      border: "rgba(255,255,255,0.12)",
    }
  );
}

export function Home() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [apps, setApps] = useState<any[]>([]);
  const [allApps, setAllApps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAllApps() {
      const { data, error } = await supabase
        .from("ListAPKGAMES")
        .select("*")
        .order("id", { ascending: false });

      if (!error) setAllApps(data || []);
    }

    fetchAllApps();
  }, []);

  useEffect(() => {
    async function fetchApps() {
      setIsLoading(true);

      let query = supabase
        .from("ListAPKGAMES")
        .select("*")
        .order("id", { ascending: false });

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

  const btnBase: React.CSSProperties = {
    outline: "none",
    WebkitTapHighlightColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
  };

  const cardBg: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
  };

  return (
    <div className="space-y-5 pb-8">
      {/* SEARCH + FILTER */}
      <section className="space-y-3 pt-1">
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "14px",
          }}
        >
          <Search
            className="h-4 w-4 shrink-0"
            style={{ color: "rgba(255,255,255,0.3)" }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search games or apps..."
            style={{
              background: "none",
              border: "none",
              outline: "none",
              color: "white",
              fontFamily: "inherit",
              fontSize: "14px",
              width: "100%",
            }}
          />
        </div>

        <div className="flex gap-2">
          {[
            { label: "ALL", value: "", icon: null },
            { label: "GAMES", value: "GAME", icon: <Gamepad2 className="h-3.5 w-3.5" /> },
            { label: "APPS", value: "APP", icon: <Smartphone className="h-3.5 w-3.5" /> },
          ].map(({ label, value, icon }) => (
            <button
              key={value}
              onClick={() => setTypeFilter(value)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-all duration-200"
              style={
                typeFilter === value
                  ? {
                      ...btnBase,
                      background: "rgba(124,58,237,0.3)",
                      color: "#c4b5fd",
                      border: "1px solid rgba(124,58,237,0.5)",
                      borderRadius: "999px",
                    }
                  : {
                      ...btnBase,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.5)",
                      borderRadius: "999px",
                    }
              }
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCategoryFilter("")}
              style={
                categoryFilter === ""
                  ? {
                      ...btnBase,
                      background: "rgba(124,58,237,0.25)",
                      color: "#c4b5fd",
                      border: "1px solid rgba(124,58,237,0.4)",
                      borderRadius: "999px",
                      padding: "4px 12px",
                      fontSize: "12px",
                      fontWeight: 700,
                    }
                  : {
                      ...btnBase,
                      background: "rgba(255,255,255,0.05)",
                      color: "rgba(255,255,255,0.45)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "999px",
                      padding: "4px 12px",
                      fontSize: "12px",
                      fontWeight: 700,
                    }
              }
            >
              SEMUA
            </button>

            {categories.map((cat) => {
              const style = getCategoryStyle(cat);
              const isActive = categoryFilter === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat === categoryFilter ? "" : cat)}
                  style={{
                    ...btnBase,
                    background: isActive ? style.bg : "rgba(255,255,255,0.05)",
                    color: isActive ? style.color : "rgba(255,255,255,0.45)",
                    border: `1px solid ${isActive ? style.border : "rgba(255,255,255,0.08)"}`,
                    borderRadius: "999px",
                    padding: "4px 12px",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* RECOMMENDED */}
      {recommended.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full" style={{ background: "#7c3aed" }} />
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              RECOMMENDED
            </h2>
          </div>

          <div>
            {recommended.map((app) => (
              <div key={app.id} className="mb-2 last:mb-0">
                <Link href={`/app/${app.id}`}>
                  <div
                    className="relative overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                    style={{ borderRadius: "16px", height: "110px" }}
                  >
                    {app.icon_url && (
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url(${app.icon_url})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          filter: "blur(8px) brightness(0.6)",
                          transform: "scale(1.1)",
                        }}
                      />
                    )}

                    <div
                      className="absolute inset-0"
                      style={{
                        background: app.icon_url
                          ? "rgba(10,8,30,0.25)"
                          : `linear-gradient(135deg, ${app.icon_color || "#7c3aed"}55, rgba(10,8,30,0.5))`,
                      }}
                    />

                    {!app.icon_url && (
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundColor: app.icon_color || "#7c3aed",
                          opacity: 0.25,
                        }}
                      />
                    )}

                    <div className="relative z-10 h-full flex items-center gap-4 px-4">
                      <div
                        className="w-14 h-14 shrink-0 overflow-hidden flex items-center justify-center font-black text-lg"
                        style={{
                          borderRadius: "14px",
                          backgroundColor: app.icon_color || "#7c3aed",
                          border: "1px solid rgba(255,255,255,0.15)",
                        }}
                      >
                        {app.icon_url ? (
                          <img
                            src={app.icon_url}
                            alt={app.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white">{app.icon_initials || "AP"}</span>
                        )}
                      </div>

                      <div>
                        <p className="font-black text-base text-white leading-tight">{app.name}</p>

                        <div className="flex gap-1.5 mt-1.5 flex-wrap">
                          <span
                            className="text-[11px] font-bold px-2 py-0.5"
                            style={{
                              background: "rgba(255,255,255,0.15)",
                              color: "rgba(255,255,255,0.8)",
                              borderRadius: "999px",
                            }}
                          >
                            {app.type}
                          </span>

                          {app.category &&
                            (() => {
                              const s = getCategoryStyle(app.category);
                              return (
                                <span
                                  className="text-[11px] font-bold px-2 py-0.5"
                                  style={{
                                    background: s.bg,
                                    color: s.color,
                                    border: `1px solid ${s.border}`,
                                    borderRadius: "999px",
                                  }}
                                >
                                  {app.category}
                                </span>
                              );
                            })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MOST RECENT UPDATES */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-1 h-4 rounded-full"
              style={{ background: "rgba(255,255,255,0.3)" }}
            />
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              MOST RECENT UPDATES
            </h2>
          </div>

          <span
            className="text-xs font-bold"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            {filteredApps.length} apps
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "16px",
                }}
              />
            ))}
          </div>
        ) : filteredApps.length === 0 ? (
          <div
            className="p-10 text-center font-bold text-sm"
            style={{ ...cardBg, color: "rgba(255,255,255,0.25)" }}
          >
            No apps found
          </div>
        ) : (
          <div>
            {filteredApps.map((app) => {
              const catStyle = getCategoryStyle(app.category);

              return (
                <div key={app.id} className="mb-3 last:mb-0">
                  <Link href={`/app/${app.id}`}>
                    <div
                      className="cursor-pointer transition-all duration-200 hover:bg-white/[0.06] p-4"
                      style={cardBg}
                    >
                      {app.mod_features && (
                        <p className="text-xs font-bold mb-3" style={{ color: "#a78bfa" }}>
                          {app.mod_features}
                        </p>
                      )}

                      <div className="flex gap-4 items-center">
                        <div
                          className="w-14 h-14 shrink-0 overflow-hidden flex items-center justify-center font-black text-sm"
                          style={{
                            borderRadius: "14px",
                            backgroundColor: app.icon_color || "#7c3aed",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          {app.icon_url ? (
                            <img
                              src={app.icon_url}
                              alt={app.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white">{app.icon_initials || "AP"}</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-black text-base text-white leading-tight truncate">
                            {app.name}
                          </p>

                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "rgba(255,255,255,0.35)" }}
                          >
                            v{app.version || "1.0"} • {app.size || "??MB"}
                          </p>

                          <div className="flex gap-1.5 mt-2 flex-wrap items-center">
                            <span
                              className="text-[11px] font-bold px-2 py-0.5"
                              style={{
                                background: "rgba(255,255,255,0.08)",
                                color: "rgba(255,255,255,0.55)",
                                borderRadius: "999px",
                              }}
                            >
                              {app.type}
                            </span>

                            {app.category && (
                              <span
                                className="text-[11px] font-bold px-2 py-0.5"
                                style={{
                                  background: catStyle.bg,
                                  color: catStyle.color,
                                  border: `1px solid ${catStyle.border}`,
                                  borderRadius: "999px",
                                }}
                              >
                                {app.category}
                              </span>
                            )}

                            <span
                              className="text-[11px] font-bold px-2 py-0.5 flex items-center gap-1"
                              style={{
                                background:
                                  app.status === "ONLINE"
                                    ? "rgba(34,197,94,0.15)"
                                    : "rgba(239,68,68,0.15)",
                                color: app.status === "ONLINE" ? "#86efac" : "#fca5a5",
                                border: `1px solid ${
                                  app.status === "ONLINE"
                                    ? "rgba(34,197,94,0.3)"
                                    : "rgba(239,68,68,0.3)"
                                }`,
                                borderRadius: "999px",
                              }}
                            >
                              <Wifi className="h-2.5 w-2.5" />
                              {app.status}
                            </span>

                            {app.uploaded_at && (
                              <span
                                className="text-[11px] font-bold flex items-center gap-1"
                                style={{ color: "rgba(255,255,255,0.3)" }}
                              >
                                <Calendar className="h-2.5 w-2.5" />
                                {new Date(app.uploaded_at).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
                                    }
