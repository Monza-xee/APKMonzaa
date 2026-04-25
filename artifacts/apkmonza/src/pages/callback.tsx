import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export function Callback() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState("Memverifikasi akun...");

  useEffect(() => {
    // Supabase otomatis handle hash fragment
    // Tinggal listen ke auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setStatus("Verifikasi berhasil! Mengalihkan...");
        setTimeout(() => setLocation("/profile"), 1500);
      } else if (event === "PASSWORD_RECOVERY") {
        setLocation("/auth");
      }
    });

    // Cek session yang sudah ada
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStatus("Verifikasi berhasil! Mengalihkan...");
        setTimeout(() => setLocation("/profile"), 1500);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        className="px-8 py-6 text-center space-y-4"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "20px",
          minWidth: "280px",
        }}
      >
        <div
          className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto"
          style={{ borderColor: "#7c3aed", borderTopColor: "transparent" }}
        />
        <p className="text-sm font-bold text-white">{status}</p>
      </div>
    </div>
  );
}