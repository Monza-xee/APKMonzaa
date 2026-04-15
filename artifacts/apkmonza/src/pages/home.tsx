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
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [apps, setApps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchApps() {
      let query = supabase.from("apps").select("*");

      if (typeFilter) {
        query = query.eq("type", typeFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.log("ERROR:", error);
      } else {
        setApps(data || []);
      }

      setIsLoading(false);
    }

    fetchApps();
  }, [typeFilter]);

  const filteredApps = apps.filter((app) =>
    app.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <section className="bg-card text-card-foreground border-4 border-black brutal-shadow-lg p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-[-50px] right-[-50px] opacity-10 pointer-events-none">
          <Zap size={400} strokeWidth={3} />
        </div>
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-6">
            APK<span className="text-secondary">MONZA</span>
          </h1>
          <p className="text-xl md:text-2xl font-mono font-bold uppercase border-l-4 border-secondary pl-4">
            Curated collection of modified apps and games. No filler.
          </p>
        </div>
      </section>

      <section className="flex flex-col md:flex-row gap-4 items-center bg-card border-4 border-black p-4 brutal-shadow">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH CATALOG..."
            className="pl-10 h-12 rounded-none border-2 border-black bg-white font-mono uppercase text-lg"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Button onClick={() => setTypeFilter("")}>All</Button>
          <Button onClick={() => setTypeFilter("GAME")}>
            <Gamepad2 className="mr-2 h-4 w-4" /> Games
          </Button>
          <Button onClick={() => setTypeFilter("APP")}>
            <Box className="mr-2 h-4 w-4" /> Apps
          </Button>
        </div>
      </section>

      <section>
        {isLoading ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48 w-full border-4 border-black" />
            ))}
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="bg-card border-4 border-black p-12 text-center">
            <h2 className="text-3xl font-black uppercase">No Mods Found</h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredApps.map((app) => (
              <Link key={app.id} href={`/app/${app.id}`}>
                <Card className="border-4 border-black flex flex-col sm:flex-row">
                  
                  <div className="bg-[#f4e8ff] border-b-4 sm:border-b-0 sm:border-r-4 border-black p-4 sm:w-1/3">
                    <h3 className="font-black uppercase mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4" /> Mod Info
                    </h3>
                    <p className="text-sm">
                      {app.mod_features || "UNLOCKED / PREMIUM / NO ADS"}
                    </p>
                  </div>

                  <CardContent className="p-6 sm:w-2/3">
                    <div className="flex gap-4 mb-4">
                      <div
                        className="w-16 h-16 border-4 border-black flex items-center justify-center font-black text-xl"
                        style={{
                          backgroundColor: app.icon_color || "orange",
                        }}
                      >
                        {app.icon_initials}
                      </div>

                      <div>
                        <h2 className="text-xl font-black uppercase">
                          {app.name}
                        </h2>
                        <p className="text-sm">
                          v{app.version} • {app.size}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm mb-4">
                      {app.description}
                    </p>

                    <div className="flex gap-2 flex-wrap">
                      <Badge>{app.status}</Badge>
                      <Badge>{app.type}</Badge>
                      <Badge>{app.category}</Badge>
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
