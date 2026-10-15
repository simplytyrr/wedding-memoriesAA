"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, RefreshCw, Check, X, FlipHorizontal } from "lucide-react";

const FILTERS = [
  { id: "original", name: "Original", filterCss: "none" },
  { id: "vintage", name: "Vintage 90s", filterCss: "sepia(45%) contrast(110%) brightness(95%) saturate(85%)" },
  { id: "warm-film", name: "Warm Film", filterCss: "sepia(25%) saturate(140%) hue-rotate(-10deg) contrast(105%)" },
  { id: "bw", name: "B&W Classic", filterCss: "grayscale(100%) contrast(120%) brightness(95%)" },
  { id: "retro", name: "Retro Golden", filterCss: "sepia(55%) saturate(160%) contrast(90%) brightness(105%)" },
  { id: "polaroid", name: "Polaroid Style", filterCss: "contrast(115%) brightness(110%) saturate(80%)" },
  { id: "soft-romantic", name: "Soft Romantic", filterCss: "saturate(115%) brightness(108%) contrast(95%)" },
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
  const [selectedFilter, setSelectedFilter] = useState("original");
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
        "Kebenaran kamera disekat atau peranti ini memerlukan butang kamera terus. Sila tekan butang kamera di bawah."
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

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    const activeFilterObj = FILTERS.find((f) => f.id === selectedFilter);
    if (activeFilterObj && activeFilterObj.filterCss !== "none") {
      ctx.filter = activeFilterObj.filterCss;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.filter = "none";

    // Classic orange digital date stamp (e.g. '26 10 15)
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const dateStampText = `'${year} ${month} ${day}`;

    ctx.save();
    ctx.font = "bold 36px monospace";
    ctx.fillStyle = "#FF8C00";
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 4;
    ctx.textAlign = "right";
    ctx.fillText(dateStampText, canvas.width - 40, canvas.height - 40);
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
      0.92
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
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between text-white p-3 sm:p-5 select-none font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between z-20">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Film Roll Counter */}
        <div className="flex items-center gap-2 bg-[#2D2D2D] border border-amber-600/40 px-3.5 py-1.5 rounded-full shadow-inner">
          <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
          <span className="font-mono text-xs font-bold text-amber-400 tracking-wider">
            FILM: {remainingShots}/{shotLimit}
          </span>
        </div>

        {hasMultipleCameras && !capturedPhotoUrl && !cameraError && (
          <button
            onClick={flipCamera}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30"
            title="Tukar Kamera"
          >
            <FlipHorizontal className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Viewfinder */}
      <div className="relative flex-1 my-3 flex items-center justify-center overflow-hidden rounded-3xl bg-neutral-900 border-2 border-white/10 shadow-2xl">
        {flash && <div className="absolute inset-0 bg-white z-40 animate-fade-out" />}

        {capturedPhotoUrl ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <img src={capturedPhotoUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
          </div>
        ) : cameraError ? (
          <div className="p-6 text-center max-w-sm space-y-4">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto text-amber-400">
              <Camera className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-lg font-bold">Kamera Telefon Pintar</h3>
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
                <span>Buka Kamera Terus</span>
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
              filter: FILTERS.find((f) => f.id === selectedFilter)?.filterCss || "none",
            }}
          />
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Filter Selection Bar */}
      {!capturedPhotoUrl && !cameraError && (
        <div className="z-20 mb-2">
          <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 justify-center">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                  selectedFilter === f.id
                    ? "bg-amber-400 text-black shadow-md scale-105"
                    : "bg-white/15 text-white/80 hover:bg-white/25"
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Shutter / Bottom Controls */}
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
              className="px-8 py-3 rounded-2xl bg-[#C2737A] hover:bg-[#9F4D54] text-white font-bold text-sm shadow-xl flex items-center gap-2 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Gunakan Foto Ini</span>
            </button>
          </>
        ) : !cameraError ? (
          <div className="flex items-center justify-center w-full">
            <button
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full border-4 border-white bg-[#C2737A] active:scale-90 transition-transform shadow-2xl flex items-center justify-center p-1"
              title="Ambil Foto"
            >
              <div className="w-full h-full rounded-full border-2 border-white/50 bg-[#C2737A]" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
