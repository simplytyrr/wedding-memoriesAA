"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, RefreshCw, Check, X, FlipHorizontal } from "lucide-react";

export interface FilterDefinition {
  id: string;
  name: string;
  tag: string;
  css: string;
  applyCanvasShader: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
}

const RETRO_FILTERS: FilterDefinition[] = [
  {
    id: "original",
    name: "Original",
    tag: "RAW",
    css: "none",
    applyCanvasShader: () => {},
  },
  {
    id: "vintage-90s",
    name: "Kodak FunSaver 90s",
    tag: "VINTAGE",
    css: "sepia(45%) contrast(125%) saturate(135%) brightness(95%)",
    applyCanvasShader: (ctx, w, h) => {
      // 1. Warm amber tint overlay
      ctx.save();
      ctx.fillStyle = "rgba(255, 175, 75, 0.14)";
      ctx.globalCompositeOperation = "color-burn";
      ctx.fillRect(0, 0, w, h);

      // 2. Heavy film grain simulation
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 28;
        data[i] = Math.min(255, Math.max(0, data[i] + noise + 6)); // Red shift
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise - 6)); // Warm yellow
      }
      ctx.putImageData(imgData, 0, 0);

      // 3. Vintage corner vignette
      const gradient = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.75);
      gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      gradient.addColorStop(1, "rgba(20, 10, 0, 0.45)");
      ctx.fillStyle = gradient;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    },
  },
  {
    id: "polaroid-600",
    name: "Polaroid Color 600",
    tag: "POLAROID",
    css: "contrast(115%) brightness(108%) saturate(85%) hue-rotate(-5deg)",
    applyCanvasShader: (ctx, w, h) => {
      ctx.save();
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        // Milky faded blacks / shadows
        if (data[i] < 60) data[i] += 25;
        if (data[i + 1] < 60) data[i + 1] += 30;
        if (data[i + 2] < 60) data[i + 2] += 40; // Cool shadow tone

        const noise = (Math.random() - 0.5) * 18;
        data[i] += noise;
        data[i + 1] += noise;
        data[i + 2] += noise;
      }
      ctx.putImageData(imgData, 0, 0);

      const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.5, w / 2, h / 2, Math.max(w, h) * 0.8);
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(10, 20, 35, 0.35)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    },
  },
  {
    id: "fuji-disposable",
    name: "Fuji QuickSnap",
    tag: "FUJI GREEN",
    css: "contrast(120%) saturate(125%) hue-rotate(8deg) brightness(98%)",
    applyCanvasShader: (ctx, w, h) => {
      ctx.save();
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 22;
        data[i] = Math.min(255, Math.max(0, data[i] + noise - 4));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise + 8)); // Fuji green tone
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise + 2));
      }
      ctx.putImageData(imgData, 0, 0);
      ctx.restore();
    },
  },
  {
    id: "golden-sunset",
    name: "Warm Golden Glow",
    tag: "GOLDEN HOUR",
    css: "sepia(50%) contrast(110%) saturate(160%) brightness(102%)",
    applyCanvasShader: (ctx, w, h) => {
      ctx.save();
      // Sun leak simulation top-left corner
      const sunGradient = ctx.createRadialGradient(w * 0.1, h * 0.1, 0, w * 0.2, h * 0.2, Math.max(w, h) * 0.7);
      sunGradient.addColorStop(0, "rgba(255, 200, 100, 0.35)");
      sunGradient.addColorStop(0.5, "rgba(255, 120, 50, 0.12)");
      sunGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = sunGradient;
      ctx.globalCompositeOperation = "screen";
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    },
  },
  {
    id: "tri-x-bw",
    name: "Kodak Tri-X 400 (B&W)",
    tag: "B&W NOIR",
    css: "grayscale(100%) contrast(145%) brightness(92%)",
    applyCanvasShader: (ctx, w, h) => {
      ctx.save();
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
        const noise = (Math.random() - 0.5) * 36;
        const val = Math.min(255, Math.max(0, avg + noise));
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
      }
      ctx.putImageData(imgData, 0, 0);

      const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.4, w / 2, h / 2, Math.max(w, h) * 0.75);
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0, 0, 0, 0.55)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    },
  },
];

export default function DisposableCamera({
  onPhotoCaptured,
  onClose,
  shotLimit = 15,
  remainingShots = 15,
}: {
  onPhotoCaptured: (blob: Blob, filter: string) => void;
  onClose: () => void;
  shotLimit?: number;
  remainingShots?: number;
}) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [selectedFilter, setSelectedFilter] = useState("vintage-90s"); // Default to vintage
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [flash, setFlash] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async (mode = facingMode) => {
    stopCamera();
    setCameraError(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn("Direct camera stream error:", err);
      setCameraError(
        "Kebenaran kamera tidak dapat dibuka secara langsung di pelayar ini. Tekan butang kamera telefon di bawah."
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    startCamera(facingMode);

    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        setHasMultipleCameras(videoDevices.length > 1);
      }).catch(() => {});
    }

    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const flipCamera = () => {
    const newMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
  };

  // Play realistic shutter click sound
  const playShutterSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    playShutterSound();
    setFlash(true);
    setTimeout(() => setFlash(false), 220);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (facingMode === "user") {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }

    const activeFilter = RETRO_FILTERS.find((f) => f.id === selectedFilter) || RETRO_FILTERS[0];
    if (activeFilter.css !== "none") {
      ctx.filter = activeFilter.css;
    }

    // Draw base video frame
    ctx.drawImage(video, 0, 0, w, h);
    ctx.filter = "none";

    // Apply high-realism custom film grain, vignettes & light leaks
    activeFilter.applyCanvasShader(ctx, w, h);

    // Realistic Analog Film LCD Orange Date Stamp (e.g. '26 10 15)
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const dateStampText = `'${year} ${month} ${day}`;

    ctx.save();
    ctx.font = "bold 38px 'Courier New', monospace";
    ctx.fillStyle = "#FF7A00"; // Classic Kodak amber orange
    ctx.shadowColor = "rgba(255, 100, 0, 0.75)";
    ctx.shadowBlur = 8;
    ctx.textAlign = "right";
    ctx.fillText(dateStampText, w - 45, h - 45);

    // Inner bright core
    ctx.fillStyle = "#FFE6A0";
    ctx.shadowBlur = 0;
    ctx.fillText(dateStampText, w - 45, h - 45);
    ctx.restore();

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
          setCapturedPhotoUrl(URL.createObjectURL(blob));
          stopCamera();
        }
      },
      "image/jpeg",
      0.95
    );
  };

  const handleRetake = () => {
    setCapturedPhotoUrl(null);
    setCapturedBlob(null);
    startCamera(facingMode);
  };

  const handleConfirmPhoto = () => {
    if (capturedBlob) {
      onPhotoCaptured(capturedBlob, selectedFilter);
      onClose();
    }
  };

  const handleFallbackFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoCaptured(file, selectedFilter);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#161616] flex flex-col justify-between text-white p-3 sm:p-5 select-none font-sans">
      {/* Top Retro Camera Banner */}
      <div className="flex items-center justify-between z-20">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Vintage Film Roll Counter */}
        <div className="flex items-center gap-2 bg-[#1A1A1A] border-2 border-[#D97706]/60 px-4 py-1.5 rounded-full shadow-inner">
          <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
          <span className="font-mono text-xs font-bold text-[#F59E0B] tracking-widest">
            EXPOSURE: {remainingShots}/{shotLimit}
          </span>
        </div>

        {hasMultipleCameras && !capturedPhotoUrl && !cameraError && (
          <button
            onClick={flipCamera}
            className="w-10 h-10 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            title="Tukar Kamera"
          >
            <FlipHorizontal className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Retro Viewfinder Area */}
      <div className="relative flex-1 my-3 flex items-center justify-center overflow-hidden rounded-3xl bg-black border-4 border-[#2A2A2A] shadow-2xl">
        {flash && <div className="absolute inset-0 bg-white z-40 transition-opacity duration-150" />}

        {capturedPhotoUrl ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <img src={capturedPhotoUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
          </div>
        ) : cameraError ? (
          <div className="p-6 text-center max-w-sm space-y-4">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto text-amber-400">
              <Camera className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-lg font-bold">Kamera Peranti Anda</h3>
            <p className="text-xs text-gray-300 leading-relaxed">{cameraError}</p>
            <div>
              <input
                ref={fallbackInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFallbackFile}
              />
              <button
                onClick={() => fallbackInputRef.current?.click()}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#C2737A] hover:bg-[#9F4D54] text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                <span>Buka Kamera Telefon Terus</span>
              </button>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-all ${
              facingMode === "user" ? "scale-x-[-1]" : ""
            }`}
            style={{
              filter: RETRO_FILTERS.find((f) => f.id === selectedFilter)?.css || "none",
            }}
          />
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Realistic Film Preset Selector */}
      {!capturedPhotoUrl && !cameraError && (
        <div className="z-20 mb-2">
          <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 justify-center no-scrollbar">
            {RETRO_FILTERS.map((f) => {
              const active = selectedFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border ${
                    active
                      ? "bg-[#D97706] text-black border-[#F59E0B] shadow-lg scale-105"
                      : "bg-black/50 text-white/85 border-white/15 hover:bg-black/70"
                  }`}
                >
                  {f.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Shutter / Controls */}
      <div className="flex items-center justify-around py-3 z-20">
        {capturedPhotoUrl ? (
          <>
            <button
              onClick={handleRetake}
              className="px-6 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Ambil Semula</span>
            </button>

            <button
              onClick={handleConfirmPhoto}
              className="px-8 py-3 rounded-2xl bg-[#D97706] hover:bg-[#B45309] text-black font-bold text-sm shadow-xl flex items-center gap-2 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Gunakan Foto Retro</span>
            </button>
          </>
        ) : !cameraError ? (
          <div className="flex flex-col items-center justify-center w-full gap-2">
            <button
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full border-4 border-[#E5E7EB] bg-[#C2737A] active:scale-90 transition-transform shadow-2xl flex items-center justify-center p-1.5 hover:brightness-110"
              title="Snap Retro Photo"
            >
              <div className="w-full h-full rounded-full border-2 border-white/60 bg-[#C2737A] shadow-inner" />
            </button>
            <span className="text-[10px] tracking-wider text-gray-400 font-mono uppercase">
              {RETRO_FILTERS.find((f) => f.id === selectedFilter)?.tag}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
