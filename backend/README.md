# Url Downloader — Backend (FastAPI + yt-dlp)

هذا هو الـ Backend الذي يستخدمه التطبيق لتحميل الفيديوهات.

## التشغيل المحلي

```bash
pip install fastapi uvicorn yt-dlp python-dotenv
# تأكد إن ffmpeg مثبّت على النظام:
#   Ubuntu: sudo apt install ffmpeg
#   Mac:    brew install ffmpeg

uvicorn main:app --host 0.0.0.0 --port 8000
```

ثم في الواجهة، افتح الإعدادات (⚙️) وضع: `http://localhost:8000`

## النشر على Railway (الأسهل)

1. اعمل حساب على https://railway.app
2. New Project → Deploy from GitHub Repo (ارفع هذا المجلد)
3. أضف Buildpack أو Dockerfile (Railway يكتشف بايثون تلقائياً)
4. أضف Variable: `ALLOWED_ORIGIN=*` (أو دومين موقعك)
5. بعد النشر، انسخ الرابط (مثل `https://your-app.up.railway.app`)
6. الصقه في إعدادات التطبيق

## ملاحظة مهمة

`ffmpeg` لازم يكون متاح. على Railway/Render أضف `nixpacks.toml`:

```toml
[phases.setup]
nixPkgs = ["ffmpeg"]
```

أو استخدم Docker مع imageأساسه `python:3.12-slim` و `apt install ffmpeg`.

## Endpoints

- `GET /info?url=...` — معلومات الفيديو + قائمة الجودات والأحجام
- `GET /download?url=...&format=...` — تنزيل مباشر
