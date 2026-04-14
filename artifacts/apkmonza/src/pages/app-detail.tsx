import { useRoute, Link } from "wouter";
import { useGetApp, getGetAppQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Download, Zap, Info, Server, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function AppDetail() {
  const [, params] = useRoute("/app/:id");
  const id = params?.id || "";

  const { data: app, isLoading } = useGetApp(id, {
    query: { enabled: !!id, queryKey: getGetAppQueryKey(id) }
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-64 border-4 border-black rounded-none" />
        <Skeleton className="h-64 w-full border-4 border-black rounded-none" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="bg-card border-4 border-black p-12 text-center brutal-shadow">
        <h2 className="text-3xl font-black mb-4 uppercase">App Not Found</h2>
        <Link href="/">
          <Button className="rounded-none border-2 border-black font-black uppercase brutal-shadow-sm">
            Return to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-mono text-sm font-bold uppercase">
        <Link href="/" className="hover:text-primary transition-colors flex items-center">
          <ChevronLeft className="h-4 w-4 mr-1" /> Catalog
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground">{app.category}</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground">{app.name}</span>
      </div>

      {/* Hero Card */}
      <div className="bg-card border-4 border-black brutal-shadow overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-primary border-b-4 border-black z-0"></div>
        
        <div className="relative z-10 pt-16 px-6 pb-6 md:px-12 md:pb-12 flex flex-col md:flex-row gap-8 items-start">
          <div 
            className="w-32 h-32 md:w-48 md:h-48 shrink-0 border-4 border-black flex items-center justify-center font-black text-5xl md:text-7xl shadow-[4px_4px_0px_0px_#000]"
            style={{ backgroundColor: app.iconColor || 'hsl(var(--primary))', color: '#000' }}
          >
            {app.iconInitials}
          </div>
          
          <div className="flex-1 mt-4 md:mt-20">
            <h1 className="text-4xl md:text-6xl font-black uppercase leading-none mb-4">{app.name}</h1>
            
            <div className="flex flex-wrap gap-3 mb-6">
              <Badge className="rounded-none px-3 py-1 text-sm border-2 border-black bg-secondary text-secondary-foreground font-bold uppercase shadow-[2px_2px_0px_0px_#000]">
                {app.status}
              </Badge>
              <Badge className="rounded-none px-3 py-1 text-sm border-2 border-black bg-primary text-primary-foreground font-bold uppercase shadow-[2px_2px_0px_0px_#000]">
                {app.type}
              </Badge>
              <Badge variant="outline" className="rounded-none px-3 py-1 text-sm border-2 border-black font-bold uppercase bg-background shadow-[2px_2px_0px_0px_#000]">
                {app.category}
              </Badge>
            </div>
            
            <Button size="lg" className="w-full md:w-auto rounded-none border-4 border-black font-black text-lg uppercase bg-accent hover:bg-accent/90 text-accent-foreground brutal-shadow-sm brutal-shadow-hover h-16 px-8">
              <Download className="mr-2 h-6 w-6" /> Download APK ({app.size})
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="md:col-span-2 space-y-8">
          {/* Mod Features */}
          <section className="bg-[#f4e8ff] border-4 border-black p-6 md:p-8 brutal-shadow">
            <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3 text-black">
              <Zap className="h-6 w-6" /> Mod Features
            </h2>
            <div className="font-mono text-base md:text-lg whitespace-pre-wrap leading-relaxed">
              {app.modFeatures || "NO MOD FEATURES SPECIFIED."}
            </div>
          </section>

          {/* Description */}
          <section className="bg-card border-4 border-black p-6 md:p-8 brutal-shadow">
            <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
              <Info className="h-6 w-6" /> Description
            </h2>
            <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-lg">
              {app.description || "NO DESCRIPTION AVAILABLE."}
            </div>
          </section>
        </div>

        {/* Right Column: Tech Specs */}
        <div className="space-y-8">
          <section className="bg-card border-4 border-black brutal-shadow">
            <div className="border-b-4 border-black p-4 bg-muted">
              <h2 className="text-xl font-black uppercase flex items-center gap-2">
                <Server className="h-5 w-5" /> Tech Specs
              </h2>
            </div>
            <div className="p-0">
              <dl className="font-mono text-sm">
                <div className="border-b-2 border-black p-4 flex justify-between gap-4">
                  <dt className="font-bold uppercase text-muted-foreground">Version</dt>
                  <dd className="text-right">{app.version}</dd>
                </div>
                <div className="border-b-2 border-black p-4 flex justify-between gap-4">
                  <dt className="font-bold uppercase text-muted-foreground">Size</dt>
                  <dd className="text-right">{app.size}</dd>
                </div>
                <div className="border-b-2 border-black p-4 flex justify-between gap-4">
                  <dt className="font-bold uppercase text-muted-foreground flex items-center gap-1">
                    <Package className="h-4 w-4" /> Package
                  </dt>
                  <dd className="text-right break-all">{app.packageName}</dd>
                </div>
                <div className="p-4 flex justify-between gap-4">
                  <dt className="font-bold uppercase text-muted-foreground">Updated</dt>
                  <dd className="text-right">{new Date(app.updatedAt).toLocaleDateString()}</dd>
                </div>
              </dl>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
