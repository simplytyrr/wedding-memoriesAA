"use client";

import React, { useState, useEffect } from "react";
import { Shield, Trash2, Eye, ArrowLeft, RefreshCw, X, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewItem, setPreviewItem] = useState<any>(null);

  const fetchMedia = async () => {
    setLoading(true);
    const token = localStorage.getItem("next_auth_token");
    if (!token) {
      setError("Sila log masuk sebagai Super Admin terlebih dahulu.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/media", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMediaList(data.media || []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat senarai media.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleModerate = async (id: number, newStatus: string) => {
    const token = localStorage.getItem("next_auth_token");
    try {
      const res = await fetch("/api/admin/media/moderate", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) throw new Error("Gagal mengemaskini status.");
      setMediaList((prev) =>
        prev.map((m) => (m.id === id ? { ...m, moderationStatus: newStatus } : m))
      );
      if (previewItem?.id === id) {
        setPreviewItem({ ...previewItem, moderationStatus: newStatus });
      }
    } catch (err: any) {
      alert(err.message || "Ralat.");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Padam gambar daripada "${name}" secara kekal?`)) return;

    const token = localStorage.getItem("next_auth_token");
    try {
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Gagal memadam gambar.");
      setMediaList((prev) => prev.filter((m) => m.id !== id));
      if (previewItem?.id === id) setPreviewItem(null);
      alert("Gambar telah berjaya dipadamkan oleh Super Admin!");
    } catch (err: any) {
      alert(err.message || "Ralat.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#23272A] p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[#5A6065] hover:text-[#23272A]">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Laman Utama</span>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            <h1 className="font-serif text-2xl font-bold">Portal Super Admin (Cloudflare D1 & R2)</h1>
          </div>
          <button onClick={fetchMedia} className="p-2 bg-white rounded-lg border border-[#EADFCF] text-xs flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Segarkan</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-700 text-xs flex items-center justify-between">
            <span>{error}</span>
            <Link href="/login" className="font-bold underline ml-2">Log Masuk</Link>
          </div>
        )}

        <div className="bg-white border border-[#EADFCF] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-[#EADFCF] pb-3">
            <h2 className="font-serif text-lg font-bold">Semua Media Dimuat Naik ({mediaList.length})</h2>
            <span className="text-xs text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full font-semibold">
              Kuasa Penuh Admin
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-gray-500">Memuatkan senarai gambar...</div>
          ) : mediaList.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500">Tiada gambar dalam sistem pada masa ini.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {mediaList.map((item) => (
                <div key={item.id} className="border border-[#EADFCF] rounded-xl overflow-hidden bg-white shadow-2xs group flex flex-col justify-between">
                  <div className="relative aspect-square bg-gray-100">
                    <img src={item.filePath} alt="Media" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-2 space-y-1">
                    <p className="text-[11px] font-bold truncate">{item.guestName}</p>
                    <p className="text-[10px] text-gray-500 truncate">{item.eventTitle || "Majlis"}</p>
                    
                    {/* Moderate approve/reject buttons */}
                    <div className="flex gap-1 pt-1">
                      {item.moderationStatus !== "approved" && (
                        <button
                          onClick={() => handleModerate(item.id, "approved")}
                          className="flex-1 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white text-[9px] font-bold transition-colors"
                        >
                          Lulus
                        </button>
                      )}
                      {item.moderationStatus !== "rejected" && (
                        <button
                          onClick={() => handleModerate(item.id, "rejected")}
                          className="flex-1 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white text-[9px] font-bold transition-colors"
                        >
                          Tolak
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(item.id, item.guestName)}
                      className="w-full mt-1 py-1 rounded bg-red-50 hover:bg-red-600 text-red-600 hover:text-white text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Padam</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
