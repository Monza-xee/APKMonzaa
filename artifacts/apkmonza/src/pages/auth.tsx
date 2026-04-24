import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useLocation } from "wouter";
import { Zap, Eye, EyeOff, Mail, Lock, User } from "lucide-react";

type Mode = "login" | "register";

export function Auth() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    color: "white",
    fontFamily: "inherit",
    fontSize: "14px",
    fontWeight: "600",
    padding: "12px 14px",
    width: "100%",
    outline: "none",
  };

  async function handleSubmit() {
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      setIsLoading(false);
      return;
    }

    if (mode === "register") {
      if (!username) {
        setError("Username wajib diisi.");
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("Password minimal 6 karakter.");
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Registrasi berhasil! Cek email untuk verifikasi.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("Email atau password salah.");
      } else {
        setLocation("/");
      }
    }

    setIsLoading(false);
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8"
      style={{ background: "rgba(10,8,30,1)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <div
          className="w-10 h-10 flex items-center justify-center"
          style={{
            background: "rgba(124,58,237,0.2)",
            border: "1px solid rgba(124,58,237,0.4)",
            borderRadius: "12px",
          }}
        >
          <Zap className="h-5 w-5" style={{ color: "#a78bfa" }} />
        </div>
        <span className="font-black text-lg tracking-tight uppercase" style={{ color: "#a78bfa" }}>
          APKMONZA
        </span>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >
        {/* Tab switch */}
        <div
          className="flex"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          {(["login", "register"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); setSuccess(""); }}
              className="flex-1 py-4 text-sm font-black uppercase tracking-wider transition-all"
              style={{
                color: mode === m ? "#a78bfa" : "rgba(255,255,255,0.3)",
                borderBottom: mode === m ? "2px solid #7c3aed" : "2px solid transparent",
                background: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {m === "login" ? "Login" : "Register"}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-xl font-black text-white mb-1">
              {mode === "login" ? "Selamat datang!" : "Buat akun baru"}
            </p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              {mode === "login"
                ? "Login untuk akses koleksi APK mod."
                : "Daftar untuk mulai menggunakan APKMONZA."}
            </p>
          </div>

          {/* Username (register only) */}
          {mode === "register" && (
            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>
                Username
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. john_doe"
                  style={{ ...inputStyle, paddingLeft: "40px" }}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-bold mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: "rgba(255,255,255,0.3)" }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                style={{ ...inputStyle, paddingLeft: "40px" }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: "rgba(255,255,255,0.3)" }}
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingLeft: "40px", paddingRight: "40px" }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "rgba(255,255,255,0.3)", background: "none", cursor: "pointer" }}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Error / Success */}
          {error && (
            <div
              className="px-4 py-3 text-xs font-bold rounded-xl"
              style={{ background: "rgba(239,68,68,0.15)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              className="px-4 py-3 text-xs font-bold rounded-xl"
              style={{ background: "rgba(34,197,94,0.15)", color: "#86efac", border: "1px solid rgba(34,197,94,0.3)" }}
            >
              {success}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-3.5 font-black text-sm uppercase text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #6366f1)",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {isLoading ? "Loading..." : mode === "login" ? "Login" : "Daftar"}
          </button>

          {/* Forgot password */}
          {mode === "login" && (
            <button
              onClick={async () => {
                if (!email) { setError("Masukkan email dulu."); return; }
                const { error } = await supabase.auth.resetPasswordForEmail(email);
                if (error) setError(error.message);
                else setSuccess("Link reset password dikirim ke email kamu.");
              }}
              className="w-full text-center text-xs font-bold transition-all hover:opacity-80"
              style={{ color: "rgba(255,255,255,0.3)", background: "none", cursor: "pointer", fontFamily: "inherit" }}
            >
              Lupa password?
            </button>
          )}
        </div>
      </div>
    </div>
  );
              }
