"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, LogIn, Lock, Mail, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal log masuk.");
      }

      localStorage.setItem("next_auth_token", data.token);
      localStorage.setItem("next_auth_user", JSON.stringify(data.user));

      if (data.user?.role === "superadmin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Ralat semasa log masuk.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAF7F2] font-sans">
      <div className="w-full max-w-md bg-white border border-[#EADFCF] rounded-2xl shadow-sm p-8">
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-[#5A6065] hover:text-[#23272A] mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Laman Utama</span>
        </Link>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#F4E3E5] text-[#C2737A] flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6 fill-[#C2737A]" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#23272A]">Log Masuk</h1>
          <p className="text-xs text-[#5A6065] mt-1">EverAfter Memories (Serverless Edition)</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase mb-1">Alamat Emel</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@contoh.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EADFCF] text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1">Kata Laluan</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EADFCF] text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#C2737A] hover:bg-[#9F4D54] text-white font-semibold text-sm flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? "Memproses..." : "Log Masuk Sekarang"}</span>
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#EADFCF] text-xs">
          <p className="font-semibold text-[#23272A] mb-2 text-center">Akaun Demo Ujian:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => fillDemo("owner@example.com", "password123")}
              className="p-2 rounded-lg bg-[#FAF7F2] border border-[#EADFCF] text-left hover:bg-[#F4E3E5]"
            >
              <div className="font-bold">Pemilik Majlis</div>
              <div className="text-[10px] text-gray-500">owner@example.com</div>
            </button>
            <button
              onClick={() => fillDemo("admin@example.com", "admin123")}
              className="p-2 rounded-lg bg-[#FAF7F2] border border-[#EADFCF] text-left hover:bg-[#F4E3E5]"
            >
              <div className="font-bold">Super Admin</div>
              <div className="text-[10px] text-gray-500">admin@example.com</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
