import { useState, useEffect } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Box, Gamepad2, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function Home() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [apps, setApps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchApps() {
      let query = supabase.from("ListAPKGAME").select("*");

      if (typeFilter) {
        query = query.eq("type", typeFilter);
      }

      const { data, error } = await query;

      console.log(data, error);

      if (!error) setApps(data || []);
      setIsLoading(false);
    }

    fetchApps();
  }, [typeFilter]);

  const filteredApps = apps.filter((app) =>
    (app.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10">
      {/* HERO */}
      <section className="bg-card border-4 border-black brutal-shadow-lg p-8 relative">
        <div className="absolute top-[-50px] right-[-50px] opacity-10">
          <Zap size={400} />
        </div>

        <h1 className="text-6xl font-black uppercase">
          APK<span className="text-purple-500">MONZA</span>
        </h1>

        <p className="font-mono border-l-4 pl-4 mt-4">
          Curated collection of modified apps and games. No filler.
        </p>
      </section>

      {/* SEARCH */}
      <section className="flex flex-col md:flex-row gap-4 border-4 border-black p-4 brutal-shadow">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH CATALOG..."
            className="pl-10 border-2 border-black"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setTypeFilter("")}>All</Button>
          <Button onClick={() => setTypeFilter("GAME")}>
            <Gamepad2 /> Games
          </Button>
          <Button onClick={() => setTypeFilter("APP")}>
            <Box /> Apps
          </Button>
        </div>
      </section>

      {/* LIST */}
      <section>
        {isLoading ? (
          <div className="grid gap-6">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-40 border-4 border-black" />
            ))}
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="border-4 border-black p-10 text-center">
            No Mods Found
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredApps.map((app) => (
              <Link key={app.id} href={`/app/${app.id}`}>
                <Card className="border-4 border-black brutal-shadow flex flex-col sm:flex-row">

                  {/* MOD INFO */}
                  <div className="bg-purple-200 border-b-4 sm:border-b-0 sm:border-r-4 border-black p-4 sm:w-1/3">
                    <h3 className="font-black flex gap-2 items-center">
                      <Zap size={16} /> MOD INFO
                    </h3>
                    <p className="text-sm">
                      {app.mod_features || "UNLOCKED"}
                    </p>
                  </div>

                  {/* CONTENT */}
                  <CardContent className="p-4 sm:w-2/3">
                    <div className="flex gap-4 mb-3">
                      <div
                        className="w-14 h-14 border-4 border-black flex items-center justify-center font-black"
                        style={{
                          backgroundColor: app.icon_color || "yellow",
                        }}
                      >
                        {app.icon_initials || "AP"}
                      </div>

                      <div>
                        <h2 className="font-black text-xl">
                          {app.name || "NO NAME"}
                        </h2>
                        <p className="text-sm">
                          v{app.version || "1.0"} • {app.size || "??MB"}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm mb-2">
                      {app.description || "-"}
                    </p>

                    <div className="flex gap-2 flex-wrap">
                      <Badge>{app.status || "OFFLINE"}</Badge>
                      <Badge>{app.type || "-"}</Badge>
                      <Badge>{app.category || "-"}</Badge>
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
