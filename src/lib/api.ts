// Backend API client. The Python FastAPI backend (yt-dlp) must be deployed
// separately (Railway / Render / VPS) and its URL stored here.
// Users can override the URL at runtime from the Settings dialog.

const STORAGE_KEY = "url_downloader_api_base";
const DEFAULT_BASE =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL) || "";

export function getApiBase(): string {
  if (typeof window === "undefined") return DEFAULT_BASE;
  return window.localStorage.getItem(STORAGE_KEY) || DEFAULT_BASE;
}

export function setApiBase(url: string) {
  if (typeof window === "undefined") return;
  const trimmed = url.trim().replace(/\/+$/, "");
  if (trimmed) window.localStorage.setItem(STORAGE_KEY, trimmed);
  else window.localStorage.removeItem(STORAGE_KEY);
}

export interface VideoFormat {
  format_id: string;
  ext: string;
  quality: string;        // e.g. "1080p", "720p", "audio"
  filesize?: number;      // bytes
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
  duration?: number;          // seconds
  view_count?: number;
  like_count?: number;
  webpage_url: string;
  platform: string;           // youtube, tiktok, instagram, facebook, ...
  is_playlist: boolean;
  entries?: VideoInfo[];      // when playlist
  formats?: VideoFormat[];
}

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

async function ensureBase(): Promise<string> {
  const base = getApiBase();
  if (!base) {
    throw new ApiError(
      "لم يتم ضبط رابط الخادم بعد. افتح الإعدادات وأضف رابط الـ Backend الخاص بك.",
    );
  }
  return base;
}

export async function fetchInfo(url: string): Promise<VideoInfo> {
  const base = await ensureBase();
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
  const base = getApiBase();
  return `${base}/download?url=${encodeURIComponent(url)}&format=${encodeURIComponent(format)}`;
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
