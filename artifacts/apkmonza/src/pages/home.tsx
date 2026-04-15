import { useState, useEffect } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Box, Gamepad2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function Home() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [apps, setApps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchApps() {
      let query = supabase.from("ListAPKGAME").select("*");

      if (typeFilter) {
        query = query.eq("type", typeFilter);
      }

      const { data, error } = await query;

      console.log("DATA:", data);
      console.log("ERROR:", error);

      if (error) {
        console.log(error);
      } else {
        setApps(data || []);
      }

      setIsLoading(false);
    }

    fetchApps();
  }, [typeFilter]);

  const filteredApps = apps.filter((app) =>
    (app.name || app.package || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 p-4">
      {/* SEARCH */}
      <section className="flex flex-col md:flex-row gap-4 items-center border-2 border-black p-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH..."
            className="pl-10 h-12 border-2 border-black"
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

      {/* LIST */}
      <section>
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center p-10 border-2 border-black">
            <h2 className="text-xl font-bold">No Data</h2>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredApps.map((app) => (
              <Link key={app.id} href={`/app/${app.id}`}>
                <Card className="border-2 border-black">
                  <CardContent className="p-4">
                    <h2 className="font-bold text-lg">
                      {app.name || "No Name"}
                    </h2>

                    <p className="text-sm text-gray-500">
                      {app.package || "-"}
                    </p>

                    <p className="text-sm">
                      {app.description || "No description"}
                    </p>

                    <div className="text-xs mt-2">
                      {app.type || "-"} | {app.category || "-"}
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
