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
    <div className="space-y-6 pt-0 px-4 pb-4">

      {/* SEARCH + FILTER */}
      <section className="flex flex-col gap-4 border-4 border-black p-4 brutal-shadow bg-white -mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH GAMES OR APPS..."
            className="pl-10 border-2 border-black rounded-none font-mono uppercase"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setTypeFilter("")}
            className={`border-2 border-black font-black rounded-none ${
              typeFilter === ""
                ? "bg-yellow-400 text-black hover:bg-yellow-300"
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            ALL
          </Button>
          <Button
            onClick={() => setTypeFilter("GAME")}
            className={`border-2 border-black font-black rounded-none ${
              typeFilter === "GAME"
                ? "bg-yellow-400 text-black hover:bg-yellow-300"
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            <Gamepad2 className="mr-1 h-4 w-4" /> GAMES
          </Button>
          <Button
            onClick={() => setTypeFilter("APP")}
            className={`border-2 border-black font-black rounded-none ${
              typeFilter === "APP"
                ? "bg-yellow-400 text-black hover:bg-yellow-300"
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            <Box className="mr-1 h-4 w-4" /> APPS
          </Button>
        </div>

        {/* FILTER KATEGORI */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setCategoryFilter("")}
              className={`shrink-0 px-3 py-1 border-2 border-black font-black text-xs uppercase rounded-none transition-colors ${
                categoryFilter === ""
                  ? "bg-black text-yellow-400"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              SEMUA
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat === categoryFilter ? "" : cat)}
                className={`shrink-0 px-3 py-1 border-2 border-black font-black text-xs uppercase rounded-none transition-colors ${
                  categoryFilter === cat
                    ? "bg-black text-yellow-400"
                    : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* RECOMMENDED - horizontal scroll */}
      <section>
        <h2 className="font-black uppercase text-base mb-3 border-l-4 border-yellow-400 pl-2">
          RECOMMENDED
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {allApps.length === 0
            ? [1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-44 h-36 shrink-0 border-4 border-black" />
              ))
            : recommended.map((app) => (
                <Link key={app.id} href={`/app/${app.id}`}>
                  <div className="w-44 shrink-0 border-4 border-black brutal-shadow bg-white cursor-pointer hover:translate-x-0.5 hover:translate-y-0.5 transition-transform">
                    <div
                      className="w-full h-24 flex items-center justify-center font-black text-sm overflow-hidden border-b-4 border-black"
                      style={{ backgroundColor: app.icon_color || "#facc15" }}
                    >
                      {app.icon_url ? (
                        <img
                          src={app.icon_url}
                          alt={app.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        app.icon_initials || "AP"
                      )}
                    </div>
                    <div className="p-2">
                      <p className="font-black text-xs uppercase leading-tight line-clamp-2">
                        {app.name || "NO NAME"}
                      </p>
                      <div className="flex gap-1 flex-wrap mt-1">
                        <Badge className="bg-yellow-400 text-black border-0 rounded-none font-bold uppercase text-[10px] px-1">
                          {app.type || "-"}
                        </Badge>
                        {app.category && (
                          <Badge className="bg-white text-black border-2 border-black rounded-none font-bold uppercase text-[10px] px-1">
                            {app.category}
                          </Badge>
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
        <h2 className="font-black uppercase text-base mb-3 border-l-4 border-black pl-2">
          MOST RECENT UPDATES
        </h2>
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-40 border-4 border-black" />
            ))}
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="border-4 border-black p-10 text-center font-black uppercase">
            No Mods Found
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredApps.map((app) => (
              <Link key={app.id} href={`/app/${app.id}`}>
                <Card className="border-4 border-black brutal-shadow flex flex-col rounded-none cursor-pointer hover:translate-x-1 hover:translate-y-1 transition-transform">

                  {/* MOD INFO */}
                  <div className="bg-purple-100 border-b-4 border-black px-4 py-3">
                    <p className="font-black text-lg uppercase leading-tight">
                      {app.mod_features || "UNLOCKED"}
                    </p>
                  </div>

                  {/* CONTENT */}
                  <CardContent className="p-4">
                    <div className="flex gap-4 mb-3 items-center">
                      <div
                        className="w-14 h-14 border-4 border-black flex items-center justify-center font-black text-sm shrink-0 overflow-hidden"
                        style={{ backgroundColor: app.icon_color || "#facc15" }}
                      >
                        {app.icon_url ? (
                          <img
                            src={app.icon_url}
                            alt={app.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          app.icon_initials || "AP"
                        )}
                      </div>

                      <div className="flex flex-col justify-center">
                        <h2 className="font-black text-lg uppercase leading-tight">
                          {app.name || "NO NAME"}
                        </h2>
                        <p className="text-sm text-gray-500">
                          v{app.version || "1.0"} • {app.size || "??MB"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Badge className="bg-yellow-400 text-black border-0 rounded-none font-bold uppercase text-xs">
                        {app.type || "-"}
                      </Badge>
                      <Badge className="bg-white text-black border-2 border-black rounded-none font-bold uppercase text-xs">
                        {app.category || "-"}
                      </Badge>
                      <Badge className="bg-purple-600 text-white border-0 rounded-none font-bold uppercase text-xs">
                        {app.status || "OFFLINE"}
                      </Badge>
                      <Badge className="bg-white text-black border-2 border-black rounded-none font-bold uppercase text-xs">
                        {app.uploaded_at
                          ? new Date(app.uploaded_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </Badge>
                    </div>
                  </CardContent>

                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
