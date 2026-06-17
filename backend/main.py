"""
Url Downloader — FastAPI backend (yt-dlp)
=========================================

Deploy to: Railway / Render / Fly.io / VPS / any host that runs Python + ffmpeg.

Endpoints
---------
GET  /info?url=<video_or_playlist_url>
     Returns metadata: title, thumbnail, uploader, description, views, likes,
     and formats list with quality + filesize. Playlists return { is_playlist: true,
     entries: [...] } with each entry containing the same shape (minus formats
     unless you pass &full=1).

GET  /download?url=<video_url>&format=<format_id_or_selector>
     Streams the video file to the client. `format` may be a yt-dlp format_id
     returned by /info, or a selector like "best[height<=720]".

Install
-------
    pip install fastapi uvicorn yt-dlp python-dotenv
    # System: ffmpeg

Run
---
    uvicorn main:app --host 0.0.0.0 --port 8000

Environment
-----------
    ALLOWED_ORIGIN=*   (or your frontend domain)
"""

import os
import uuid
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import yt_dlp

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

app = FastAPI(title="Url Downloader API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("ALLOWED_ORIGIN", "*")],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

COOKIE_FILE = "cookies.txt"


def _quality_label(f: dict) -> str:
    if f.get("vcodec") == "none":
        abr = f.get("abr")
        return f"صوت {int(abr)}kbps" if abr else "صوت فقط"
    height = f.get("height")
    if height:
        fps = f.get("fps")
        return f"{height}p" + (f" {int(fps)}fps" if fps and fps > 30 else "")
    return f.get("format_note") or f.get("format") or "—"


def _platform_from_url(url: str) -> str:
    u = url.lower()
    if "youtube.com" in u or "youtu.be" in u:
        return "youtube"
    if "tiktok.com" in u:
        return "tiktok"
    if "instagram.com" in u:
        return "instagram"
    if "facebook.com" in u or "fb.watch" in u:
        return "facebook"
    if "twitter.com" in u or "x.com" in u:
        return "twitter"
    return "other"


def _serialize_formats(info: dict) -> list:
    formats = info.get("formats") or []
    out = []
    seen = set()
    for f in formats:
        if f.get("ext") in ("mhtml",):
            continue
        if not f.get("url") and not f.get("manifest_url"):
            continue
        has_video = f.get("vcodec") and f.get("vcodec") != "none"
        has_audio = f.get("acodec") and f.get("acodec") != "none"
        key = (f.get("height"), f.get("ext"), bool(has_audio), bool(has_video))
        if key in seen:
            continue
        seen.add(key)
        out.append({
            "format_id": f.get("format_id"),
            "ext": f.get("ext") or "mp4",
            "quality": _quality_label(f),
            "filesize": f.get("filesize") or f.get("filesize_approx"),
            "vcodec": f.get("vcodec"),
            "acodec": f.get("acodec"),
            "fps": f.get("fps"),
            "has_audio": bool(has_audio),
            "has_video": bool(has_video),
        })
    def sort_key(x):
        if x["has_video"] and x["has_audio"]:
            grp = 0
        elif x["has_video"]:
            grp = 1
        else:
            grp = 2
        h = 0
        try:
            h = int((x["quality"] or "").rstrip("p").split()[0])
        except Exception:
            pass
        return (grp, -h)
    out.sort(key=sort_key)
    return out


def _serialize_info(info: dict, include_formats: bool = True) -> dict:
    return {
        "id": info.get("id") or "",
        "title": info.get("title") or "video",
        "description": info.get("description") or "",
        "thumbnail": info.get("thumbnail"),
        "uploader": info.get("uploader") or info.get("channel"),
        "uploader_url": info.get("uploader_url") or info.get("channel_url"),
        "duration": info.get("duration"),
        "view_count": info.get("view_count"),
        "like_count": info.get("like_count"),
        "webpage_url": info.get("webpage_url") or info.get("original_url") or "",
        "platform": _platform_from_url(info.get("webpage_url") or ""),
        "is_playlist": False,
        "formats": _serialize_formats(info) if include_formats else [],
    }


def _base_ydl_opts() -> dict:
    opts = {
        "quiet": True,
        "no_warnings": True,
    }
    if os.path.exists(COOKIE_FILE):
        opts["cookiefile"] = COOKIE_FILE
    return opts


@app.get("/")
async def root():
    return {"name": "Url Downloader API", "endpoints": ["/info", "/download"]}


@app.get("/info")
async def get_info(url: str = Query(...), full: int = 0):
    """Return metadata for a single video or a playlist."""
    ydl_opts = {
        **_base_ydl_opts(),
        "skip_download": True,
        "extract_flat": "in_playlist",
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"تعذّر قراءة الرابط: {e}")

    if info.get("_type") == "playlist" or info.get("entries"):
        entries_in = info.get("entries") or []
        entries_out = []
        for e in entries_in:
            if not e:
                continue
            entry_url = e.get("url") or e.get("webpage_url") or ""
            if entry_url and not entry_url.startswith("http"):
                entry_url = e.get("webpage_url") or url
            entries_out.append({
                "id": e.get("id") or "",
                "title": e.get("title") or "video",
                "thumbnail": e.get("thumbnail") or (
                    f"https://i.ytimg.com/vi/{e.get('id')}/hqdefault.jpg"
                    if _platform_from_url(url) == "youtube" and e.get("id") else None
                ),
                "duration": e.get("duration"),
                "webpage_url": entry_url,
                "platform": _platform_from_url(entry_url or url),
                "is_playlist": False,
                "formats": [],
            })
        return JSONResponse({
            "id": info.get("id") or "",
            "title": info.get("title") or "Playlist",
            "description": info.get("description") or "",
            "thumbnail": info.get("thumbnail"),
            "uploader": info.get("uploader"),
            "webpage_url": info.get("webpage_url") or url,
            "platform": _platform_from_url(url),
            "is_playlist": True,
            "entries": entries_out,
        })

    return JSONResponse(_serialize_info(info, include_formats=True))


@app.get("/download")
async def download_video(url: str = Query(...), format: str = Query("best")):
    """Download then stream the file. `format` is a yt-dlp selector or format_id."""
    try:
        uid = uuid.uuid4().hex[:10]
        output_template = f"/tmp/{uid}.%(ext)s"

        ydl_opts = {
            **_base_ydl_opts(),
            "format": format,
            "outtmpl": output_template,
            "merge_output_format": "mp4",
            "restrictfilenames": True,
        }
        if format.startswith("bestaudio"):
            ydl_opts["postprocessors"] = [{
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }]

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.extract_info(url, download=True)

        path: Optional[str] = None
        for f in os.listdir("/tmp"):
            if f.startswith(uid):
                path = os.path.join("/tmp", f)
                break
        if not path or not os.path.exists(path):
            raise HTTPException(status_code=500, detail="فشل التنزيل.")

        ext = path.rsplit(".", 1)[-1]
        filename = f"video.{ext}"

        def iterfile():
            try:
                with open(path, "rb") as fh:
                    while chunk := fh.read(1024 * 1024):
                        yield chunk
            finally:
                try: os.unlink(path)
                except OSError: pass

        return StreamingResponse(
            iterfile(),
            media_type="application/octet-stream",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Length": str(os.path.getsize(path)),
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ أثناء التنزيل: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
