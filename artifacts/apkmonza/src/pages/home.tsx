import { useState, useEffect } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";
import { Input } from "@/components/ui/input";
import { Search, Box, Gamepad2 } from "lucide-react";
import { AdDisplay } from "./AdDisplay";

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
    const matchSearch = (app.name || "")
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchCategory = categoryFilter
      ? app.category === categoryFilter
      : true;
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

  return (
    <div className="space-y-6 pt-0 pb-8">

      {/* SEARCH + FILTER */}
      <section
        className="flex flex-col gap-4 p-4 mx-1"
        style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          marginTop: "8px",
        }}
      >
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: "rgba(255,255,255,0.3)" }}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH GAMES OR APPS..."
            className="pl-10 border-0 outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-white/25 text-xs font-black uppercase tracking-widest"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "999px",
              fontFamily: "inherit",
              outline: "none",
              boxShadow: "none",
            }}
          />
        </div>

        <div className="flex gap-2">
          {[
            { label: "ALL", value: "", icon: null },
            { label: "GAMES", value: "GAME", icon: <Gamepad2 className="mr-1 h-3.5 w-3.5" /> },
            { label: "APPS", value: "APP", icon: <Box className="mr-1 h-3.5 w-3.5" /> },
          ].map(({ label, value, icon }) => (
            <button
              key={value}
              onClick={() => setTypeFilter(value)}
              className="flex items-center px-4 py-2 text-xs font-black uppercase transition-all duration-200"
              style={
                typeFilter === value
                  ? {
                      ...btnBase,
                      background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                      color: "white",
                      borderRadius: "999px",
                      boxShadow: "0 4px 15px rgba(124,58,237,0.4)",
                    }
                  : {
                      ...btnBase,
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.55)",
                      borderRadius: "999px",
                    }
              }
            >
              {icon}{label}
            </button>
          ))}
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setCategoryFilter("")}
              className="shrink-0 px-3 py-1 text-xs font-black uppercase transition-all"
              style={
                categoryFilter === ""
                  ? {
                      ...btnBase,
                      background: "rgba(124,58,237,0.25)",
                      color: "#c4b5fd",
                      border: "1px solid rgba(124,58,237,0.4)",
                      borderRadius: "999px",
                    }
                  : {
                      ...btnBase,
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.4)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "999px",
                    }
              }
            >
              SEMUA
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat === categoryFilter ? "" : cat)}
                className="shrink-0 px-3 py-1 text-xs font-black uppercase transition-all"
                style={
                  categoryFilter === cat
                    ? {
                        ...btnBase,
                        background: "rgba(124,58,237,0.25)",
                        color: "#c4b5fd",
                        border: "1px solid rgba(124,58,237,0.4)",
                        borderRadius: "999px",
                      }
                    : {
                        ...btnBase,
                        background: "rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.4)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "999px",
                      }
                }
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* RECOMMENDED */}
      <section>
        <h2
          className="font-black uppercase text-sm mb-3 pl-3 tracking-widest"
          style={{ color: "rgba(255,255,255,0.9)", borderLeft: "3px solid #7c3aed" }}
        >
          RECOMMENDED
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {allApps.length === 0
            ? [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-44 h-36 shrink-0 animate-pulse"
                  style={{ background: "rgba(255,255,255,0.07)", borderRadius: "16px" }}
                />
              ))
            : recommended.map((app) => (
                <Link key={app.id} href={`/app/${app.id}`}>
                  <div
                    className="w-44 shrink-0 cursor-pointer transition-all duration-200 hover:scale-[1.03] overflow-hidden"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "16px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                    }}
                  >
                    <div
                      className="w-full h-24 flex items-center justify-center font-black text-lg overflow-hidden"
                      style={{
                        backgroundColor: app.icon_color || "#7c3aed",
                        borderRadius: "16px 16px 0 0",
                      }}
                    >
                      {app.icon_url ? (
                        <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white">{app.icon_initials || "AP"}</span>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p
                        className="font-black text-xs uppercase leading-tight line-clamp-1 tracking-wide"
                        style={{ color: "rgba(255,255,255,0.9)" }}
                      >
                        {app.name || "NO NAME"}
                      </p>
                      <div className="flex gap-1 flex-wrap mt-1.5">
                        <span
                          className="text-[10px] font-black uppercase px-2 py-0.5"
                          style={{
                            background: "rgba(124,58,237,0.3)",
                            color: "#c4b5fd",
                            borderRadius: "999px",
                          }}
                        >
                          {app.type || "-"}
                        </span>
                        {app.category && (
                          <span
                            className="text-[10px] font-black uppercase px-2 py-0.5"
                            style={{
                              background: "rgba(255,255,255,0.08)",
                              color: "rgba(255,255,255,0.5)",
                              borderRadius: "999px",
                            }}
                          >
                            {app.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
        </div>
      </section>

      {/* MOST RECENT UPDATES */}
      <section>
        <h2
          className="font-black uppercase text-sm mb-3 pl-3 tracking-widest"
          style={{ color: "rgba(255,255,255,0.9)", borderLeft: "3px solid rgba(255,255,255,0.3)" }}
        >
          MOST RECENT UPDATES
        </h2>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse"
                style={{ background: "rgba(255,255,255,0.07)", borderRadius: "16px" }}
              />
            ))}
          </div>
        ) : filteredApps.length === 0 ? (
          <div
            className="p-10 text-center font-black uppercase tracking-widest text-sm"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "16px",
              color: "rgba(255,255,255,0.25)",
            }}
          >
            No Mods Found
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredApps.map((app, index) => (
              <>
                <Link key={app.id} href={`/app/${app.id}`}>
                  <div
                    className="overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      borderRadius: "16px",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                    }}
                  >
                    {/* MOD FEATURE BANNER */}
                    <div
                      className="px-4 py-2.5"
                      style={{
                        background: "linear-gradient(90deg, rgba(124,58,237,0.3), rgba(99,102,241,0.1))",
                        borderBottom: "1px solid rgba(124,58,237,0.15)",
                      }}
                    >
                      <p className="font-black text-xs uppercase tracking-widest" style={{ color: "#c4b5fd" }}>
                        {app.mod_features || "UNLOCKED"}
                      </p>
                    </div>

                    {/* CONTENT */}
                    <div className="p-4">
                      <div className="flex gap-4 mb-3 items-center">
                        <div
                          className="w-14 h-14 flex items-center justify-center font-black text-sm shrink-0 overflow-hidden"
                          style={{
                            backgroundColor: app.icon_color || "#7c3aed",
                            borderRadius: "14px",
                            border: "1px solid rgba(255,255,255,0.12)",
                            boxShadow: "0 2px 12px rgba(0,0,0,0.35)",
                          }}
                        >
                          {app.icon_url ? (
                            <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white text-base">{app.icon_initials || "AP"}</span>
                          )}
                        </div>
                        <div className="flex flex-col justify-center gap-0.5">
                          <h2
                            className="font-black text-base uppercase leading-tight tracking-wide"
                            style={{ color: "rgba(255,255,255,0.95)" }}
                          >
                            {app.name || "NO NAME"}
                          </h2>
                          <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>
                            v{app.version || "1.0"} • {app.size || "??MB"}
                          </p>
                        </div>
                      </div>

                      {/* BADGES */}
                      <div className="flex gap-2 flex-wrap">
                        {[
                          {
                            text: app.type || "-",
                            bg: "rgba(124,58,237,0.25)",
                            color: "#c4b5fd",
                            border: "rgba(124,58,237,0.3)",
                          },
                          {
                            text: app.category || "-",
                            bg: "rgba(255,255,255,0.07)",
                            color: "rgba(255,255,255,0.5)",
                            border: "rgba(255,255,255,0.1)",
                          },
                          {
                            text: app.status || "OFFLINE",
                            bg: app.status === "ONLINE" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
                            color: app.status === "ONLINE" ? "#86efac" : "#fca5a5",
                            border: app.status === "ONLINE" ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)",
                          },
                          {
                            text: app.uploaded_at
                              ? new Date(app.uploaded_at).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "-",
                            bg: "rgba(255,255,255,0.05)",
                            color: "rgba(255,255,255,0.35)",
                            border: "rgba(255,255,255,0.07)",
                          },
                        ].map((badge, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-black uppercase px-2.5 py-0.5"
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
                </Link>

              
            ))}
          </div>
        )}
      </section>
    </div>
  );
                        }
