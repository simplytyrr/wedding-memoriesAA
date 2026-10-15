"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useParams } from "next/navigation";
import confetti from "canvas-confetti";
import {
  Heart,
  Camera,
  Upload,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import DisposableCamera from "@/components/DisposableCamera";

function GuestPageContent() {
  const params = useParams();
  const slug = (params?.slug as string) || "adam-hawa";

  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraFilter, setCameraFilter] = useState("original");
  const [selectedFile, setSelectedFile] = useState<File | Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<any>(null);
  const [uploadError, setUploadError] = useState("");
  const [activePhoto, setActivePhoto] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoCaptured = (blob: Blob, filter: string) => {
    setCameraFilter(filter);
    setSelectedFile(blob);
    setPreviewUrl(URL.createObjectURL(blob));
    setModalOpen(true);
  };

  const fetchEvent = async () => {
    try {
      const res = await fetch(`/api/events?slug=${slug}`);
      const data = await res.json();
      setEventData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [slug]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setUploadError("Saiz fail melebihi 15MB.");
      return;
    }

    setUploadError("");
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setModalOpen(true);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !message.trim()) {
      setUploadError("Sila pilih foto atau tuliskan ucapan.");
      return;
    }

    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("slug", slug);
    if (selectedFile) formData.append("photo", selectedFile);
    if (guestName.trim()) formData.append("guest_name", guestName.trim());
    if (message.trim()) formData.append("message", message.trim());

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal memuat naik.");
      }

      setUploadSuccess(data);
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });

      setSelectedFile(null);
      setPreviewUrl("");
      setMessage("");
      
      // Auto refresh event gallery
      setTimeout(() => {
        fetchEvent();
      }, 1000);
    } catch (err: any) {
      setUploadError(err.message || "Ralat semasa muat naik.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="w-10 h-10 rounded-full border-3 border-[#C2737A] border-t-transparent animate-spin" />
      </div>
    );
  }

  const event = eventData?.event;
  const photos = eventData?.photos || [];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#23272A] pb-24 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-[#EADFCF] pt-12 pb-8 px-4 text-center">
        <div className="max-w-xl mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#F4E3E5] text-[#C2737A] flex items-center justify-center mx-auto shadow-xs">
            <Heart className="w-6 h-6 fill-[#C2737A]" />
          </div>

          <span className="text-xs uppercase tracking-widest font-semibold text-[#C2737A] block">
            EverAfter Memories • Cloudflare Ready
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#23272A]">
            {event?.coupleNames || event?.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#5A6065]">
            <span className="inline-flex items-center gap-1 font-medium bg-[#FAF7F2] px-2.5 py-1 rounded-full border border-[#EADFCF]">
              <Calendar className="w-3.5 h-3.5 text-[#C2737A]" />
              <span>{event?.eventDate}</span>
            </span>
            {event?.venue && (
              <span className="inline-flex items-center gap-1 font-medium bg-[#FAF7F2] px-2.5 py-1 rounded-full border border-[#EADFCF]">
                <MapPin className="w-3.5 h-3.5 text-[#C2737A]" />
                <span className="truncate max-w-[200px]">{event?.venue}</span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Upload Card */}
        <div className="bg-white border-2 border-[#C2737A]/30 rounded-3xl p-6 sm:p-8 text-center shadow-md">
          <div className="max-w-md mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9F4D54] bg-[#F4E3E5] px-3 py-1 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Kongsikan Detik Anda</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#23272A]">
              Ambil Gambar & Tulis Ucapan
            </h2>

            <p className="text-xs sm:text-sm text-[#5A6065]">
              Foto akan disimpan selamat ke storan <strong>Cloudflare R2</strong> tanpa membebankan server VPS anda!
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setCameraOpen(true)}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#C2737A] hover:bg-[#9F4D54] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                <span>Buka Kamera Retro</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white border border-[#EADFCF] hover:bg-[#FAF7F2] text-[#23272A] font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4 text-[#C2737A]" />
                <span>Pilih dari Galeri Telefon</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>

        {/* Gallery */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#23272A]">
                Galeri Kenangan Tetamu
              </h2>
              <span className="text-xs bg-[#F4E3E5] text-[#9F4D54] font-bold px-2 py-0.5 rounded-full">
                {photos.length} Foto
              </span>
            </div>

            <button
              onClick={fetchEvent}
              className="p-2 text-[#5A6065] hover:text-[#23272A] hover:bg-white rounded-lg transition-colors flex items-center gap-1 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Segarkan</span>
            </button>
          </div>

          {photos.length === 0 ? (
            <div className="bg-white border border-[#EADFCF] rounded-2xl p-10 text-center">
              <Camera className="w-10 h-10 text-[#C2737A] mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold text-[#23272A]">Belum ada gambar yang diluluskan.</p>
              <p className="text-xs text-[#5A6065] mt-1">Jadilah orang pertama yang berkongsi foto!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {photos.map((p: any) => (
                <div
                  key={p.id}
                  onClick={() => setActivePhoto(p)}
                  className="bg-white border border-[#EADFCF] rounded-2xl overflow-hidden shadow-xs cursor-pointer group flex flex-col justify-between"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={
                        p.filePath.startsWith("http")
                          ? p.filePath
                          : p.filePath.startsWith("/uploads/")
                          ? `/api/media/events_${p.weddingEventId || 1}/photos/${p.filePath.split("/").pop()}`
                          : p.filePath
                      }
                      alt={p.guestName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e: any) => {
                        // Fallback jika direct path ada isu
                        if (!e.target.src.includes("/api/media/")) {
                          const fname = p.filePath.split("/").pop();
                          e.target.src = `/api/media/events_${p.weddingEventId || 1}/photos/${fname}`;
                        }
                      }}
                    />
                  </div>
                  <div className="p-2 text-left border-t border-[#EADFCF]/60">
                    <p className="text-xs font-bold text-[#23272A] truncate">{p.guestName || "Tetamu"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Upload Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF7F2] text-[#5A6065] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            {uploadSuccess ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-serif text-xl font-bold">Berjaya Dihantar!</h3>
                <p className="text-xs text-[#5A6065]">{uploadSuccess.message}</p>
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setUploadSuccess(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#C2737A] text-white text-xs font-semibold"
                >
                  Tutup & Lihat Galeri
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpload} className="space-y-4">
                <h3 className="font-serif text-xl font-bold text-center">Hantarkan Foto Anda</h3>

                {uploadError && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs">{uploadError}</div>
                )}

                {previewUrl && (
                  <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-black">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Nama Anda</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Contoh: Pakcik Din & Keluarga"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EADFCF] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Ucapan & Doa</label>
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tahniah pengantin baru..."
                    className="w-full p-3 rounded-xl border border-[#EADFCF] text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-3 rounded-xl bg-[#C2737A] hover:bg-[#9F4D54] text-white font-bold text-sm flex items-center justify-center gap-2"
                >
                  {uploading ? "Sedang Memuat Naik..." : "Hantar Foto Sekarang"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <button
            onClick={() => setActivePhoto(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-xl w-full bg-white rounded-2xl overflow-hidden">
            <div className="bg-black max-h-[70vh] flex items-center justify-center">
              <img src={activePhoto.filePath} alt="Photo" className="max-h-[70vh] object-contain" />
            </div>
            <div className="p-4">
              <p className="font-bold text-[#23272A]">{activePhoto.guestName || "Tetamu"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Disposable Retro Camera Modal */}
      {cameraOpen && (
        <DisposableCamera
          onPhotoCaptured={handlePhotoCaptured}
          onClose={() => setCameraOpen(false)}
        />
      )}
    </div>
  );
}

export default function GuestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">Memuatkan...</div>}>
      <GuestPageContent />
    </Suspense>
  );
}
