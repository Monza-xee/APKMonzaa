import { Link } from "wouter";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-[100dvh] flex flex-col text-foreground selection:bg-secondary selection:text-secondary-foreground"
      style={{
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      {/* HEADER */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          background: "rgba(15,12,41,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        }}
      >
        <div className="w-full max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-10 h-10 flex items-center justify-center font-black text-base text-white transition-all duration-200 group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(124,58,237,0.5)",
              }}
            >
              AM
            </div>
            <span className="font-black text-xl tracking-tighter uppercase text-white">
              APK<span style={{ color: "#a78bfa" }}>MONZA</span>
            </span>
          </Link>

          <nav>
            <Link href="/">
              <span
                className="font-black text-xs tracking-widest uppercase text-white px-4 py-2 transition-all duration-200 hover:scale-105 cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                  borderRadius: "10px",
                  boxShadow: "0 4px 15px rgba(124,58,237,0.45)",
                }}
              >
                CATALOG
              </span>
            </Link>
          </nav>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* FOOTER */}
      <footer
        className="py-8 mt-12"
        style={{
          background: "rgba(15,12,41,0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="w-full max-w-3xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 flex items-center justify-center font-black text-xs text-white"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(124,58,237,0.4)",
              }}
            >
              AM
            </div>
            <span className="font-black text-lg tracking-tighter text-white">
              APKMONZA
            </span>
          </div>
          <p
            className="font-mono text-xs font-bold uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            APKMONZA &copy; 2026. NO FILLER.
          </p>
        </div>
      </footer>
    </div>
  );
}
