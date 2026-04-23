import { Link } from "wouter";
import { Zap } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col text-foreground">
      {/* HEADER */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          background: "rgba(10,8,30,0.9)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="w-full max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 flex items-center justify-center transition-all duration-200 group-hover:scale-105"
              style={{
                background: "rgba(124,58,237,0.2)",
                border: "1px solid rgba(124,58,237,0.4)",
                borderRadius: "10px",
              }}
            >
              <Zap className="h-4 w-4" style={{ color: "#a78bfa" }} />
            </div>
            <span className="font-black text-base tracking-tight uppercase" style={{ color: "#a78bfa" }}>
              APKMONZA
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link href="/">
              <span
                className="text-xs font-bold uppercase tracking-wider cursor-pointer transition-all hover:opacity-80"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                CATALOG
              </span>
            </Link>
          </nav>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-5">
        {children}
      </main>

      {/* FOOTER */}
      <footer
        className="py-6 mt-8"
        style={{
          background: "rgba(10,8,30,0.7)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="w-full max-w-2xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 flex items-center justify-center"
              style={{
                background: "rgba(124,58,237,0.2)",
                border: "1px solid rgba(124,58,237,0.3)",
                borderRadius: "8px",
              }}
            >
              <Zap className="h-3.5 w-3.5" style={{ color: "#a78bfa" }} />
            </div>
            <span className="font-black text-sm tracking-tight uppercase text-white">
              APKMONZA
            </span>
          </div>
          <p
            className="font-mono text-xs font-bold uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            APKMONZA &copy; 2026. NO FILLER.
          </p>
        </div>
      </footer>
    </div>
  );
}
