import { Link } from "wouter";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background/95 text-foreground selection:bg-secondary selection:text-secondary-foreground">
      <header className="sticky top-0 z-50 w-full border-b-4 border-black bg-card brutal-shadow">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-secondary text-secondary-foreground border-2 border-black flex items-center justify-center font-black text-xl brutal-shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              AM
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase">APK<span className="text-secondary">MONZA</span></span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="font-bold text-sm tracking-wider uppercase hover:text-primary transition-colors">
              Catalog
            </Link>
            <Link href="/admin" className="font-bold text-sm tracking-wider uppercase bg-primary text-primary-foreground px-4 py-2 border-2 border-black brutal-shadow brutal-shadow-hover transition-all">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t-4 border-black bg-card py-8 mt-12 brutal-shadow">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-secondary text-secondary-foreground border-2 border-black flex items-center justify-center font-black text-sm brutal-shadow">
              AM
            </div>
            <span className="font-black text-xl tracking-tighter">APKMONZA</span>
          </div>
          <p className="font-mono text-sm font-bold uppercase text-muted-foreground">
            APKMONZA &copy; 2026. NO FILLER.
          </p>
        </div>
      </footer>
    </div>
  );
}
