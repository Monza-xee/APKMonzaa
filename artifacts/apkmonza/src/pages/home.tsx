import { useState, useEffect } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Box, Gamepad2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function Home() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [apps, setApps] = useState<any[]>([]);
  const [allApps, setAllApps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAllApps() {
      const { data, error } = await supabase.from("ListAPKGAMES").select("*");
      if (!error) setAllApps(data || []);
    }
    fetchAllApps();
  }, []);

  useEffect(() => {
    async function fetchApps() {
      setIsLoading(true);
      let query = supabase.from("ListAPKGAMES").select("*").order("uploaded_at", { ascending: false });
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

  return (
    <div
      className="space-y-6 pt-0 px-4 pb-4 min-h-screen"
      style={{
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      }}
    >

      {/* SEARCH + FILTER */}
      <section
        className="-mt-4 flex flex-col gap-4 p-4"
        style={{
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderTop: "none",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "rgba(255,255,255,0.4)" }} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH GAMES OR APPS..."
            className="pl-10 border font-mono uppercase text-white placeholder:text-white/30 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
            }}
          />
        </div>

        <div className="flex gap-2">
          {[
            { label: "ALL", value: "", icon: null },
            { label: "GAMES", value: "GAME", icon: <Gamepad2 className="mr-1 h-4 w-4" /> },
            { label: "APPS", value: "APP", icon: <Box className="mr-1 h-4 w-4" /> },
          ].map(({ label, value, icon }) => (
            <button
              key={value}
              onClick={() => setTypeFilter(value)}
              className="flex items-center px-3 py-2 text-sm font-black uppercase rounded-xl transition-all duration-200"
              style={
                typeFilter === value
                  ? {
                      background: "linear-gradient(135deg, #a78bfa, #818cf8)",
                      color: "white",
                      boxShadow: "0 4px 15px rgba(167,139,250,0.4)",
                    }
                  : {
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.7)",
                    }
              }
            >
              {icon}{label}
            </button>
          ))}
        </div>

        {/* FILTER KATEGORI */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setCategoryFilter("")}
              className="shrink-0 px-3 py-1 text-xs font-black uppercase rounded-lg transition-all"
              style={
                categoryFilter === ""
                  ? { background: "rgba(167,139,250,0.3)", color: "#c4b5fd", border: "1px solid rgba(167,139,250,0.5)" }
                  : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }
              }
            >
              SEMUA
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat === categoryFilter ? "" : cat)}
                className="shrink-0 px-3 py-1 text-xs font-black uppercase rounded-lg transition-all"
                style={
                  categoryFilter === cat
                    ? { background: "rgba(167,139,250,0.3)", color: "#c4b5fd", border: "1px solid rgba(167,139,250,0.5)" }
                    : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }
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
          className="font-black uppercase text-sm mb-3 pl-3"
          style={{
            color: "rgba(255,255,255,0.9)",
            borderLeft: "3px solid #a78bfa",
            letterSpacing: "0.1em",
          }}
        >
          RECOMMENDED
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {allApps.length === 0
            ? [1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className="w-44 h-36 shrink-0 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                />
              ))
            : recommended.map((app) => (
                <Link key={app.id} href={`/app/${app.id}`}>
                  <div
                    className="w-44 shrink-0 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-2xl overflow-hidden"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)",
                      border: "1px solid rgba(255,255,255,0.14)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                    }}
                  >
                    <div
                      className="w-full h-24 flex items-center justify-center font-black text-sm overflow-hidden"
                      style={{ backgroundColor: app.icon_color || "#7c3aed" }}
                    >
                      {app.icon_url ? (
                        <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-xl">{app.icon_initials || "AP"}</span>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="font-black text-xs uppercase leading-tight line-clamp-2 text-white/90">
                        {app.name || "NO NAME"}
                      </p>
                      <div className="flex gap-1 flex-wrap mt-1">
                        <span
                          className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(167,139,250,0.3)", color: "#c4b5fd" }}
                        >
                          {app.type || "-"}
                        </span>
                        {app.category && (
                          <span
                            className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
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

      {/* LIST */}
      <section>
        <h2
          className="font-black uppercase text-sm mb-3 pl-3"
          style={{
            color: "rgba(255,255,255,0.9)",
            borderLeft: "3px solid rgba(255,255,255,0.4)",
            letterSpacing: "0.1em",
          }}
        >
          MOST RECENT UPDATES
        </h2>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2].map((i) => (
              <Skeleton
                key={i}
                className="h-40 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.08)" }}
              />
            ))}
          </div>
        ) : filteredApps.length === 0 ? (
          <div
            className="p-10 text-center font-black uppercase rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            No Mods Found
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredApps.map((app) => (
              <Link key={app.id} href={`/app/${app.id}`}>
                <div
                  className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-2xl"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.13)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
                  }}
                >
                  {/* MOD INFO BANNER */}
                  <div
                    className="px-4 py-3"
                    style={{
                      background: "linear-gradient(90deg, rgba(124,58,237,0.4), rgba(99,102,241,0.2))",
                      borderBottom: "1px solid rgba(167,139,250,0.25)",
                    }}
                  >
                    <p className="font-black text-sm uppercase leading-tight" style={{ color: "#c4b5fd" }}>
                      {app.mod_features || "UNLOCKED"}
                    </p>
                  </div>

                  {/* CONTENT */}
                  <div className="p-4">
                    <div className="flex gap-4 mb-3 items-center">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-sm shrink-0 overflow-hidden"
                        style={{
                          backgroundColor: app.icon_color || "#7c3aed",
                          border: "1px solid rgba(255,255,255,0.15)",
                          boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
                        }}
                      >
                        {app.icon_url ? (
                          <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white">{app.icon_initials || "AP"}</span>
                        )}
                      </div>

                      <div className="flex flex-col justify-center">
                        <h2 className="font-black text-base uppercase leading-tight text-white">
                          {app.name || "NO NAME"}
                        </h2>
                        <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                          v{app.version || "1.0"} • {app.size || "??MB"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {[
                        { text: app.type || "-", style: { background: "rgba(167,139,250,0.25)", color: "#c4b5fd" } },
                        { text: app.category || "-", style: { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" } },
                        { text: app.status || "OFFLINE", style: { background: "rgba(124,58,237,0.35)", color: "#a78bfa" } },
                        {
                          text: app.uploaded_at
                            ? new Date(app.uploaded_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                            : "-",
                          style: { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)" },
                        },
                      ].map((badge, i) => (
                        <span
                          key={i}
                          className="text-xs font-bold uppercase px-2 py-0.5 rounded-full"
                          style={{ border: "1px solid rgba(255,255,255,0.1)", ...badge.style }}
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
