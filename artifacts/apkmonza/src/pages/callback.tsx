import { useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export function Callback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setLocation("/profile");
      } else if (event === "PASSWORD_RECOVERY") {
        setLocation("/auth");
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div
        className="px-6 py-4 text-sm font-bold text-white text-center space-y-2"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "16px",
        }}
      >
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p>Memverifikasi akun...</p>
      </div>
    </div>
  );
}