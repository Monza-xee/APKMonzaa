import { useState, useEffect } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";
import { Input } from "@/components/ui/input";
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
      className="space-y-6 pt-0 px-4 pb-8"
      style={{
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        minHeight: "100vh",
      }}
    >

      {/* SEARCH + FILTER */}
      <section
        className="-mt-4 flex flex-col gap-4 p-4"
        style={{
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderTop: "none",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* Search input */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: "rgba(255,255,255,0.35)" }}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH GAMES OR APPS..."
            className="pl-10 border-0 outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-white/30 rounded-xl text-xs font-black uppercase tracking-widest"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(10px)",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Type filter */}
        <div className="flex gap-2">
          {[
            { label: "ALL", value: "", icon: null },
            { label: "GAMES", value: "GAME", icon: <Gamepad2 className="mr-1 h-3.5 w-3.5" /> },
            { label: "APPS", value: "APP", icon: <Box className="mr-1 h-3.5 w-3.5" /> },
          ].map(({ label, value, icon }) => (
            <button
              key={value}
              onClick={() => setTypeFilter(value)}
              className="flex items-center px-4 py-2 text-xs font-black uppercase rounded-xl transition-all duration-200"
              style={
                typeFilter === value
                  ? {
                      background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                      color: "white",
                      boxShadow: "0 4px 15px rgba(124,58,237,0.45)",
                    }
                  : {
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.6)",
                    }
              }
            >
              {icon}{label}
            </button>
          ))}
        </div>

        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setCategoryFilter("")}
              className="shrink-0 px-3 py-1 text-xs font-black uppercase rounded-lg transition-all"
              style={
                categoryFilter === ""
                  ? {
                      background: "rgba(124,58,237,0.3)",
                      color: "#c4b5fd",
                      border: "1px solid rgba(124,58,237,0.5)",
                    }
                  : {
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.45)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }
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
                    ? {
                        background: "rgba(124,58,237,0.3)",
                        color: "#c4b5fd",
                        border: "1px solid rgba(124,58,237,0.5)",
                      }
                    : {
                        background: "rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.45)",
                        border: "1px solid rgba(255,255,255,0.1)",
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
          style={{
            color: "rgba(255,255,255,0.9)",
            borderLeft: "3px solid #7c3aed",
          }}
        >
          RECOMMENDED
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {allApps.length === 0
            ? [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-44 h-36 shrink-0 rounded-2xl animate-pulse"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                />
              ))
            : recommended.map((app) => (
                <Link key={app.id} href={`/app/${app.id}`}>
                  <div
                    className="w-44 shrink-0 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.03] overflow-hidden"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
                    }}
                  >
                    <div
                      className="w-full h-24 flex items-center justify-center font-black text-lg overflow-hidden"
                      style={{ backgroundColor: app.icon_color || "#7c3aed" }}
                    >
                      {app.icon_url ? (
                        <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white">{app.icon_initials || "AP"}</span>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="font-black text-xs uppercase leading-tight line-clamp-1 tracking-wide" style={{ color: "rgba(255,255,255,0.9)" }}>
                        {app.name || "NO NAME"}
                      </p>
                      <div className="flex gap-1 flex-wrap mt-1.5">
                        <span
                          className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(124,58,237,0.35)", color: "#c4b5fd" }}
                        >
                          {app.type || "-"}
                        </span>
                        {app.category && (
                          <span
                            className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)" }}
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
          style={{
            color: "rgba(255,255,255,0.9)",
            borderLeft: "3px solid rgba(255,255,255,0.35)",
          }}
        >
          MOST RECENT UPDATES
        </h2>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-40 rounded-2xl animate-pulse"
                style={{ background: "rgba(255,255,255,0.08)" }}
              />
            ))}
          </div>
        ) : filteredApps.length === 0 ? (
          <div
            className="p-10 text-center font-black uppercase rounded-2xl tracking-widest text-sm"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            No Mods Found
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredApps.map((app) => (
              <Link key={app.id} href={`/app/${app.id}`}>
                <div
                  className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.11)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
                  }}
                >
                  {/* MOD FEATURE BANNER */}
                  <div
                    className="px-4 py-2.5"
                    style={{
                      background: "linear-gradient(90deg, rgba(124,58,237,0.35), rgba(99,102,241,0.15))",
                      borderBottom: "1px solid rgba(124,58,237,0.2)",
                    }}
                  >
                    <p
                      className="font-black text-xs uppercase tracking-widest"
                      style={{ color: "#c4b5fd" }}
                    >
                      {app.mod_features || "UNLOCKED"}
                    </p>
                  </div>

                  {/* CONTENT */}
                  <div className="p-4">
                    <div className="flex gap-4 mb-3 items-center">
                      {/* ICON dengan borderRadius fix */}
                      <div
                        className="w-14 h-14 flex items-center justify-center font-black text-sm shrink-0 overflow-hidden"
                        style={{
                          backgroundColor: app.icon_color || "#7c3aed",
                          borderRadius: "14px",
                          border: "1px solid rgba(255,255,255,0.15)",
                          boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
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
                        <p
                          className="text-xs font-medium"
                          style={{ color: "rgba(255,255,255,0.4)" }}
                        >
                          v{app.version || "1.0"} • {app.size || "??MB"}
                        </p>
                      </div>
                    </div>

                    {/* BADGES */}
                    <div className="flex gap-2 flex-wrap">
                      <span
                        className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full"
                        style={{
                          background: "rgba(124,58,237,0.3)",
                          color: "#c4b5fd",
                          border: "1px solid rgba(124,58,237,0.3)",
                        }}
                      >
                        {app.type || "-"}
                      </span>
                      <span
                        className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full"
                        style={{
                          background: "rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.55)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        {app.category || "-"}
                      </span>
                      <span
                        className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full"
                        style={{
                          background: "rgba(99,102,241,0.3)",
                          color: "#a5b4fc",
                          border: "1px solid rgba(99,102,241,0.3)",
                        }}
                      >
                        {app.status || "OFFLINE"}
                      </span>
                      <span
                        className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.4)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        {app.uploaded_at
                          ? new Date(app.uploaded_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </span>
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
