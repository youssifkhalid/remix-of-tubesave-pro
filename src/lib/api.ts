// Backend API client. Backend URL is hardcoded — no user-facing settings.

const HARDCODED_BASE = "https://remix-of-tubesave-pro-production.up.railway.app";

export function getApiBase(): string {
  return HARDCODED_BASE;
}

export function setApiBase(_url: string) {
  // No-op: API base is hardcoded and not user-configurable.
}

export interface VideoFormat {
  format_id: string;
  ext: string;
  quality: string;
  filesize?: number;
  vcodec?: string;
  acodec?: string;
  fps?: number;
  has_audio: boolean;
  has_video: boolean;
}

export interface VideoInfo {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  uploader?: string;
  uploader_url?: string;
  duration?: number;
  view_count?: number;
  like_count?: number;
  webpage_url: string;
  platform: string;
  is_playlist: boolean;
  entries?: VideoInfo[];
  formats?: VideoFormat[];
}

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

export async function fetchInfo(url: string): Promise<VideoInfo> {
  const base = HARDCODED_BASE;
  const res = await fetch(`${base}/info?url=${encodeURIComponent(url)}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    let msg = `فشل جلب معلومات الفيديو (${res.status})`;
    try {
      const j = await res.json();
      if (j?.detail) msg = j.detail;
    } catch {}
    throw new ApiError(msg, res.status);
  }
  return res.json();
}

export function buildDownloadUrl(url: string, format: string) {
  return `${HARDCODED_BASE}/download?url=${encodeURIComponent(url)}&format=${encodeURIComponent(format)}`;
}

export function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  const arabicUnits = ["بايت", "ك.ب", "م.ب", "ج.ب"];
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${arabicUnits[i]}`;
}

export function formatNumber(n?: number): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function detectPlatform(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("tiktok.com")) return "tiktok";
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("facebook.com") || u.includes("fb.watch")) return "facebook";
  if (u.includes("twitter.com") || u.includes("x.com")) return "twitter";
  return "other";
}
