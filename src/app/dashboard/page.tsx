"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Images,
  CheckCircle2,
  Clock,
  Heart,
  QrCode,
  Sparkles,
  LogOut,
  ExternalLink,
  PlusCircle,
  Copy,
  Check,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("next_auth_user");
    const token = localStorage.getItem("next_auth_token");

    if (!token || !savedUser) {
      router.push("/login");
      return;
    }

    try {
      setUser(JSON.parse(savedUser));
    } catch {
      router.push("/login");
      return;
    }

    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.events || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("next_auth_token");
    localStorage.removeItem("next_auth_user");
    router.push("/login");
  };

  const copyGuestLink = (slug: string) => {
    const url = `${window.location.origin}/e/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-[#C2737A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#23272A] font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-[#EADFCF] sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#F4E3E5] flex items-center justify-center text-[#C2737A]">
            <Heart className="w-4 h-4 fill-[#C2737A]" />
          </div>
          <span className="font-serif text-lg font-bold text-[#23272A]">EverAfter Memories</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#5A6065] hidden sm:inline">
            {user?.name} ({user?.role})
          </span>
          {user?.role === "superadmin" && (
            <Link
              href="/admin"
              className="text-xs font-semibold bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-200"
            >
              Super Admin
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Log Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white border border-[#EADFCF] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4E3E5] text-[#9F4D54] text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Portal Pemilik Majlis</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">Selamat Datang, {user?.name}</h1>
            <p className="text-xs sm:text-sm text-[#5A6065] mt-1">
              Foto tetamu anda kini disimpan secara terus ke <strong>Cloudflare R2 Object Storage</strong>.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#23272A] hover:bg-[#374151] text-white text-xs font-semibold shadow-xs"
          >
            <span>Urus Semua Gambar (Admin)</span>
          </Link>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-bold">Senarai Majlis Anda</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((ev) => (
              <div key={ev.id} className="bg-white border border-[#EADFCF] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {ev.status}
                    </span>
                    <span className="text-xs text-[#5A6065]">{ev.eventDate}</span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[#23272A]">{ev.title}</h3>
                  <p className="text-xs text-[#C2737A] font-semibold mt-0.5">{ev.coupleNames}</p>
                  {ev.venue && <p className="text-xs text-gray-500 mt-2 truncate">{ev.venue}</p>}

                  {/* Quick toggle moderation */}
                  <div className="mt-4 pt-3 border-t border-[#EADFCF] flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700">Moderasi Foto:</span>
                    <button
                      onClick={async () => {
                        const token = localStorage.getItem("next_auth_token");
                        const newStatus = !ev.moderationEnabled;
                        await fetch("/api/events/toggle-moderation", {
                          method: "PATCH",
                          headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ eventId: ev.id, moderationEnabled: newStatus }),
                        });
                        setEvents((prev) =>
                          prev.map((item) => (item.id === ev.id ? { ...item, moderationEnabled: newStatus } : item))
                        );
                        alert(newStatus ? "Moderasi Diaktifkan (Foto perlu kelulusan)." : "Moderasi Dimatikan (Foto terus masuk ke galeri serta-merta!).");
                      }}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                        ev.moderationEnabled
                          ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                      }`}
                    >
                      {ev.moderationEnabled ? "Aktif (Perlu Lulus)" : "Mati (Terus Terbit)"}
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#EADFCF] space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Link
                      href={`/e/${ev.slug}`}
                      target="_blank"
                      className="py-2 rounded-xl bg-[#C2737A] text-white font-semibold flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Halaman Tetamu</span>
                    </Link>

                    <button
                      onClick={() => copyGuestLink(ev.slug)}
                      className="py-2 rounded-xl border border-[#EADFCF] bg-[#FAF7F2] font-semibold text-[#5A6065] flex items-center justify-center gap-1.5"
                    >
                      {copiedSlug === ev.slug ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Pautan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
