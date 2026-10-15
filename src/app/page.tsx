import Link from "next/link";
import { Heart, Sparkles, Camera, QrCode, Shield, Layers, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#23272A] flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EADFCF] sticky top-0 z-40 px-4 sm:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#F4E3E5] flex items-center justify-center text-[#C2737A]">
            <Heart className="w-5 h-5 fill-[#C2737A]" />
          </div>
          <div>
            <span className="font-serif text-xl font-bold tracking-tight text-[#23272A] block leading-none">
              EverAfter<span className="text-[#C2737A]">Memories</span>
            </span>
            <span className="text-[10px] tracking-widest text-[#5A6065] uppercase font-medium">
              Next.js + Cloudflare Serverless
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/e/adam-hawa"
            className="text-xs sm:text-sm font-semibold text-[#5A6065] hover:text-[#23272A] px-3 py-1.5 rounded-lg hover:bg-[#F0EAE1]"
          >
            Contoh Majlis
          </Link>
          <Link
            href="/login"
            className="text-xs sm:text-sm font-semibold bg-[#C2737A] hover:bg-[#9F4D54] text-white px-4 py-2 rounded-xl transition-all shadow-xs"
          >
            Log Masuk
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 px-4 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F4E3E5] border border-[#E8B4B8]/40 text-[#9F4D54] text-xs font-semibold uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Serverless • Cloudflare D1 & R2 Ready</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight text-[#23272A]">
            Abadikan Momen Majlis Dengan{" "}
            <span className="italic text-[#C2737A] underline decoration-[#E8B4B8]/50">
              Seni Bina Serverless
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#5A6065] max-w-2xl mx-auto leading-relaxed">
            Platform Next.js App Router berkelajuan tinggi. Boleh dideploy terus ke <strong>Vercel</strong> atau <strong>Cloudflare Pages</strong> tanpa memerlukan sebarang pelayan VPS berbayar!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/e/adam-hawa"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#C2737A] hover:bg-[#9F4D54] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>Buka Majlis Tetamu Demo</span>
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white border border-[#EADFCF] hover:bg-[#F0EAE1] text-[#23272A] font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4 text-[#C2737A]" />
              <span>Papan Pemuka Pemilik & Admin</span>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="pt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center max-w-3xl mx-auto border-t border-[#EADFCF]/60">
            <div className="bg-white p-4 rounded-2xl border border-[#EADFCF]">
              <p className="font-serif text-2xl font-bold text-[#23272A]">RM 0 / bln</p>
              <p className="text-xs text-[#5A6065]">Zero VPS Cost</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#EADFCF]">
              <p className="font-serif text-2xl font-bold text-[#23272A]">Cloudflare R2</p>
              <p className="text-xs text-[#5A6065]">Object Storage</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#EADFCF]">
              <p className="font-serif text-2xl font-bold text-[#23272A]">Cloudflare D1</p>
              <p className="text-xs text-[#5A6065]">Serverless SQLite</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#EADFCF]">
              <p className="font-serif text-2xl font-bold text-[#23272A]">Next.js 16</p>
              <p className="text-xs text-[#5A6065]">App Router</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
