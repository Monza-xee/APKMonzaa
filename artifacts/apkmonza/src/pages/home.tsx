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
      if (typeFilter) query = query.eq("type", typeFilter);
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
    <div className="space-y-6 p-4">

      {/* SEARCH + FILTER */}
      <section className="flex flex-col gap-4 border-4 border-black p-4 brutal-shadow bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH CATALOG Htws..."
            className="pl-10 border-2 border-black rounded-none font-mono uppercase"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setTypeFilter("")}
            className="bg-yellow-400 text-black border-2 border-black font-black rounded-none hover:bg-yellow-300"
          >
            ALL
          </Button>
          <Button
            onClick={() => setTypeFilter("GAME")}
            className="bg-white text-black border-2 border-black font-black rounded-none hover:bg-gray-100"
          >
            <Gamepad2 className="mr-1 h-4 w-4" /> GAMES
          </Button>
          <Button
            onClick={() => setTypeFilter("APP")}
            className="bg-white text-black border-2 border-black font-black rounded-none hover:bg-gray-100"
          >
            <Box className="mr-1 h-4 w-4" /> APPS
          </Button>
        </div>
      </section>

      {/* LIST */}
      <section>
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
                  <div className="bg-purple-100 border-b-4 border-black p-4">
                    <h3 className="font-black flex gap-2 items-center uppercase text-sm">
                      <Zap size={14} /> MOD INFO
                    </h3>
                    <p className="text-sm mt-1">
                      {app.mod_features || "UNLOCKED"}
                    </p>
                  </div>

                  {/* CONTENT */}
                  <CardContent className="p-4">
                    <div className="flex gap-4 mb-3">
                      <div
                        className="w-14 h-14 border-4 border-black flex items-center justify-center font-black text-sm shrink-0"
                        style={{ backgroundColor: app.icon_color || "#facc15" }}
                      >
                        {app.icon_initials || "AP"}
                      </div>

                      <div>
                        <h2 className="font-black text-lg uppercase leading-tight">
                          {app.name || "NO NAME"}
                        </h2>
                        <p className="text-sm text-gray-500">
                          v{app.version || "1.0"} • {app.size || "??MB"}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm mb-3 text-gray-600">
                      {app.description || "-"}
                    </p>

                    <div className="flex gap-2 flex-wrap">
                      <Badge className="bg-purple-600 text-white border-0 rounded-none font-bold uppercase text-xs">
                        {app.status || "OFFLINE"}
                      </Badge>
                      <Badge className="bg-yellow-400 text-black border-0 rounded-none font-bold uppercase text-xs">
                        {app.type || "-"}
                      </Badge>
                      <Badge className="bg-white text-black border-2 border-black rounded-none font-bold uppercase text-xs">
                        {app.category || "-"}
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
