import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ApiError,
  buildDownloadUrl,
  detectPlatform,
  fetchInfo,
  formatBytes,
  formatDuration,
  formatNumber,
  type VideoFormat,
  type VideoInfo,
} from "@/lib/api";
import logo from "@/assets/logo.png.asset.json";
import {
  Clipboard,
  Copy,
  Download,
  Eye,
  Heart,
  Link2,
  Loader2,
  Sparkles,
  ThumbsUp,
  Youtube,
  Music2,
  Facebook,
  Instagram,
  Zap,
  Shield,
  Smartphone,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Url Downloader — تنزيل فيديوهات يوتيوب وتيك توك وفيسبوك وإنستجرام مجاناً" },
      {
        name: "description",
        content:
          "أداة مجانية وسريعة لتنزيل الفيديوهات من يوتيوب، تيك توك، فيسبوك، وإنستجرام بأعلى جودة وبدون علامة مائية. تدعم قوائم تشغيل يوتيوب وتعمل كتطبيق على هاتفك.",
      },
    ],
  }),
  component: HomePage,
});

const PlatformIcon = ({ p, className }: { p: string; className?: string }) => {
  const cls = className ?? "h-5 w-5";
  if (p === "youtube") return <Youtube className={cls} />;
  if (p === "tiktok") return <Music2 className={cls} />;
  if (p === "instagram") return <Instagram className={cls} />;
  if (p === "facebook") return <Facebook className={cls} />;
  return <Link2 className={cls} />;
};

function HomePage() {
  const [url, setUrl] = useState("");
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [copied, setCopied] = useState<"desc" | "ok" | null>(null);
  const [selected, setSelected] = useState<string>("");
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [entryFormat, setEntryFormat] = useState<string>("best[height<=720]");

  const mutation = useMutation({
    mutationFn: (u: string) => fetchInfo(u),
    onSuccess: (data) => {
      setInfo(data);
      if (!data.is_playlist && data.formats?.length) {
        const best = data.formats.find((f) => f.has_video && f.has_audio) ?? data.formats[0];
        setSelected(best.format_id);
      } else if (data.is_playlist && data.entries) {
        setSelectedEntries(new Set(data.entries.map((e) => e.webpage_url)));
      }
    },
  });

  const platform = useMemo(() => (url ? detectPlatform(url) : ""), [url]);

  const handlePaste = async () => {
    try {
      const t = await navigator.clipboard.readText();
      if (t) setUrl(t);
    } catch {}
  };

  const handleFetch = () => {
    if (!url.trim()) return;
    setInfo(null);
    mutation.mutate(url.trim());
  };

  const handleCopyDesc = async () => {
    if (!info?.description) return;
    await navigator.clipboard.writeText(info.description);
    setCopied("desc");
    setTimeout(() => setCopied(null), 1500);
  };

  const handleDownloadSingle = () => {
    if (!info || !selected) return;
    const link = buildDownloadUrl(info.webpage_url, selected);
    window.location.href = link;
  };

  const totalSelectedSize = useMemo(() => {
    if (!info?.entries) return 0;
    return info.entries
      .filter((e) => selectedEntries.has(e.webpage_url))
      .reduce((sum, e) => {
        const fmt = e.formats?.find((f) => f.format_id === entryFormat) ?? e.formats?.[0];
        return sum + (fmt?.filesize ?? 0);
      }, 0);
  }, [info, selectedEntries, entryFormat]);

  const handleDownloadPlaylist = () => {
    if (!info?.entries) return;
    for (const e of info.entries) {
      if (!selectedEntries.has(e.webpage_url)) continue;
      const link = buildDownloadUrl(e.webpage_url, entryFormat);
      window.open(link, "_blank");
    }
  };

  return (
    <main className="relative min-h-screen px-4 py-6 pb-24 sm:px-6 sm:py-10">
      {/* Top bar */}
      <header className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={logo.url}
            alt="Url Downloader"
            width={48}
            height={48}
            className="h-10 w-10 shrink-0 sm:h-12 sm:w-12"
          />
          <div className="min-w-0">
            <h1 className="truncate text-xl font-black tracking-tight sm:text-2xl">
              <span className="text-gradient">Url</span> Downloader
            </h1>
            <p className="truncate text-xs text-muted-foreground sm:text-sm">
              تنزيل فيديوهات بأعلى جودة وبدون علامة مائية
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/about"
            className="inline-flex rounded-xl border border-border bg-card/40 px-3 py-2 text-xs font-bold transition-colors hover:bg-card sm:px-4 sm:text-sm"
          >
            عن المطور
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto mt-10 max-w-3xl text-center sm:mt-16">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-3 py-1 text-xs font-bold text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-[color:var(--brand)]" />
          سريع · مجاني · بدون علامة مائية
        </span>
        <h2 className="mt-5 text-3xl font-black leading-tight sm:text-5xl">
          نزّل أي فيديو من{" "}
          <span className="text-gradient">يوتيوب وتيك توك وفيسبوك وإنستجرام</span>
        </h2>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base">
          الصق الرابط واختر الجودة. أداتك العربية الأسرع لتحميل الفيديوهات بأعلى دقة.
        </p>

        {/* URL Input */}
        <div className="mt-7 glass rounded-2xl p-2 shadow-card animate-in-up">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              {platform && (
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--brand)]">
                  <PlatformIcon p={platform} />
                </span>
              )}
              <input
                dir="ltr"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                placeholder="https://..."
                className="w-full rounded-xl bg-background/60 px-4 py-3.5 pr-10 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePaste}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card/60 px-4 text-sm font-bold transition-colors hover:bg-card sm:w-auto"
              >
                <Clipboard className="h-4 w-4" />
                لصق
              </button>
              <button
                onClick={handleFetch}
                disabled={mutation.isPending || !url.trim()}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-brand px-6 text-sm font-black text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 sm:flex-none"
              >
                {mutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                ابدأ التنزيل
              </button>
            </div>
          </div>
        </div>

        {mutation.isError && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-right text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{(mutation.error as ApiError)?.message ?? "حدث خطأ، حاول مرة أخرى."}</p>
          </div>
        )}
      </section>

      {/* Loading skeleton */}
      {mutation.isPending && (
        <div className="mx-auto mt-8 max-w-3xl">
          <div className="shimmer h-64 rounded-2xl bg-card/40" />
        </div>
      )}

      {/* Result */}
      {info && !mutation.isPending && (
        <section className="mx-auto mt-8 max-w-3xl animate-in-up">
          {info.is_playlist ? (
            <PlaylistView
              info={info}
              entryFormat={entryFormat}
              setEntryFormat={setEntryFormat}
              selectedEntries={selectedEntries}
              setSelectedEntries={setSelectedEntries}
              totalSize={totalSelectedSize}
              onDownload={handleDownloadPlaylist}
            />
          ) : (
            <SingleView
              info={info}
              selected={selected}
              setSelected={setSelected}
              onCopyDesc={handleCopyDesc}
              copied={copied}
              onDownload={handleDownloadSingle}
            />
          )}
        </section>
      )}

      {/* Features */}
      {!info && (
        <section className="mx-auto mt-16 grid max-w-5xl gap-4 sm:grid-cols-3">
          <FeatureCard
            icon={<Zap className="h-5 w-5" />}
            title="سرعة فائقة"
            desc="معالجة فورية وتنزيل مباشر للفيديو دون انتظار."
          />
          <FeatureCard
            icon={<Shield className="h-5 w-5" />}
            title="بدون علامة مائية"
            desc="فيديوهات تيك توك وإنستجرام نظيفة 100%."
          />
          <FeatureCard
            icon={<Smartphone className="h-5 w-5" />}
            title="يعمل كتطبيق"
            desc="ثبّته على شاشتك الرئيسية واستخدمه أوفلاين."
          />
        </section>
      )}

      {/* SEO content */}
      {!info && (
        <section className="mx-auto mt-16 max-w-3xl space-y-6 text-right text-sm leading-7 text-muted-foreground">
          <article className="glass rounded-2xl p-6">
            <h3 className="mb-3 text-lg font-black text-foreground">
              ما هو Url Downloader؟
            </h3>
            <p>
              <strong className="text-foreground">Url Downloader</strong> أداة عربية مجانية وسريعة
              لتنزيل الفيديوهات من أشهر منصات التواصل الاجتماعي بما في ذلك يوتيوب YouTube، تيك توك
              TikTok، فيسبوك Facebook، وإنستجرام Instagram. تدعم الأداة تنزيل الفيديوهات بأعلى جودة
              متاحة (HD وFull HD و4K حسب توفّرها) بدون أي علامة مائية. كل ما عليك فعله هو لصق رابط
              الفيديو، اختيار الجودة المناسبة، ثم الضغط على زر التنزيل.
            </p>
          </article>
          <article className="glass rounded-2xl p-6">
            <h3 className="mb-3 text-lg font-black text-foreground">المميزات الأساسية</h3>
            <ul className="list-inside list-disc space-y-1.5">
              <li>تنزيل فيديوهات تيك توك وإنستجرام بدون شعار أو علامة مائية.</li>
              <li>دعم قوائم تشغيل يوتيوب بضغطة واحدة أو اختيار فيديوهات محددة.</li>
              <li>عرض حجم كل جودة قبل التنزيل لتختار الأنسب.</li>
              <li>عرض الصورة المصغرة، اسم القناة، الوصف، عدد المشاهدات والإعجابات.</li>
              <li>واجهة عربية متجاوبة مع جميع شاشات الموبايل والكمبيوتر.</li>
              <li>يعمل كتطبيق ويب تقدمي (PWA) — ثبّته على هاتفك واستخدمه كأي تطبيق عادي.</li>
            </ul>
          </article>
        </section>
      )}

      <footer className="mx-auto mt-20 max-w-5xl border-t border-border pt-6 text-center text-xs text-muted-foreground">
        <p>
          صُمّم وطُوّر بواسطة{" "}
          <Link to="/about" className="font-bold text-foreground hover:text-[color:var(--brand)]">
            Youssif Khalid
          </Link>{" "}
          · {new Date().getFullYear()}
        </p>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="glass rounded-2xl p-5 text-right">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
        {icon}
      </div>
      <h3 className="mt-3 text-base font-black">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function SingleView({
  info,
  selected,
  setSelected,
  onCopyDesc,
  copied,
  onDownload,
}: {
  info: VideoInfo;
  selected: string;
  setSelected: (s: string) => void;
  onCopyDesc: () => void;
  copied: "desc" | "ok" | null;
  onDownload: () => void;
}) {
  const formats = info.formats ?? [];
  const selectedFmt = formats.find((f) => f.format_id === selected);

  return (
    <div className="glass overflow-hidden rounded-2xl shadow-card">
      <div className="grid gap-4 p-4 sm:grid-cols-[200px_minmax(0,1fr)] sm:p-5">
        {info.thumbnail && (
          <div className="relative overflow-hidden rounded-xl bg-black/40">
            <img
              src={info.thumbnail}
              alt={info.title}
              loading="lazy"
              className="aspect-video w-full object-cover sm:aspect-square"
            />
            {info.duration ? (
              <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {formatDuration(info.duration)}
              </span>
            ) : null}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-bold text-[color:var(--brand)]">
            <PlatformIcon p={info.platform} className="h-3.5 w-3.5" />
            <span>{info.uploader ?? info.platform}</span>
          </div>
          <h3 className="mt-1.5 line-clamp-2 text-base font-black sm:text-lg">{info.title}</h3>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> {formatNumber(info.view_count)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" /> {formatNumber(info.like_count)}
            </span>
          </div>
          {info.description && (
            <div className="mt-3">
              <button
                onClick={onCopyDesc}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/50 px-2.5 py-1 text-xs font-bold transition-colors hover:bg-card"
              >
                {copied === "desc" ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-[color:var(--success)]" /> تم النسخ
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> نسخ الوصف
                  </>
                )}
              </button>
              <p className="mt-2 line-clamp-3 text-xs leading-6 text-muted-foreground">
                {info.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quality picker */}
      <div className="border-t border-border p-4 sm:p-5">
        <h4 className="mb-3 text-sm font-black">اختر الجودة</h4>
        <div className="grid gap-2 sm:grid-cols-2">
          {formats.map((f) => (
            <QualityRow
              key={f.format_id}
              fmt={f}
              checked={selected === f.format_id}
              onSelect={() => setSelected(f.format_id)}
            />
          ))}
        </div>

        <button
          onClick={onDownload}
          disabled={!selected}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand py-3.5 text-sm font-black text-primary-foreground shadow-glow transition-transform hover:scale-[1.01] disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          تحميل {selectedFmt ? `(${selectedFmt.quality} · ${formatBytes(selectedFmt.filesize)})` : ""}
        </button>
      </div>
    </div>
  );
}

function QualityRow({
  fmt,
  checked,
  onSelect,
}: {
  fmt: VideoFormat;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition-colors ${
        checked
          ? "border-[color:var(--brand)] bg-[color:var(--brand)]/10"
          : "border-border bg-card/40 hover:bg-card/70"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
            checked ? "border-[color:var(--brand)]" : "border-muted-foreground/40"
          }`}
        >
          {checked && <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--brand)]" />}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{fmt.quality}</p>
          <p className="text-[11px] text-muted-foreground">
            {fmt.ext.toUpperCase()}
            {fmt.has_audio ? "" : " · بدون صوت"}
          </p>
        </div>
      </div>
      <span className="shrink-0 rounded-md bg-background/60 px-2 py-1 text-[11px] font-bold text-muted-foreground">
        {formatBytes(fmt.filesize)}
      </span>
    </label>
  );
}

function PlaylistView({
  info,
  entryFormat,
  setEntryFormat,
  selectedEntries,
  setSelectedEntries,
  totalSize,
  onDownload,
}: {
  info: VideoInfo;
  entryFormat: string;
  setEntryFormat: (s: string) => void;
  selectedEntries: Set<string>;
  setSelectedEntries: (s: Set<string>) => void;
  totalSize: number;
  onDownload: () => void;
}) {
  const entries = info.entries ?? [];
  const allSelected = entries.length > 0 && selectedEntries.size === entries.length;

  const toggle = (u: string) => {
    const next = new Set(selectedEntries);
    if (next.has(u)) next.delete(u);
    else next.add(u);
    setSelectedEntries(next);
  };
  const toggleAll = () => {
    if (allSelected) setSelectedEntries(new Set());
    else setSelectedEntries(new Set(entries.map((e) => e.webpage_url)));
  };

  return (
    <div className="glass overflow-hidden rounded-2xl shadow-card">
      <div className="border-b border-border p-4 sm:p-5">
        <div className="flex items-center gap-2 text-xs font-bold text-[color:var(--brand)]">
          <PlatformIcon p={info.platform} className="h-3.5 w-3.5" />
          <span>قائمة تشغيل · {entries.length} فيديو</span>
        </div>
        <h3 className="mt-1.5 text-base font-black sm:text-lg">{info.title}</h3>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted-foreground">
              جودة الفيديوهات
            </label>
            <select
              value={entryFormat}
              onChange={(e) => setEntryFormat(e.target.value)}
              className="w-full rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]"
            >
              <option value="best[height<=360]">360p — الأخف</option>
              <option value="best[height<=480]">480p</option>
              <option value="best[height<=720]">720p HD</option>
              <option value="best[height<=1080]">1080p Full HD</option>
              <option value="best">أعلى جودة متاحة</option>
              <option value="bestaudio">صوت فقط (MP3/M4A)</option>
            </select>
          </div>
          <button
            onClick={toggleAll}
            className="h-11 self-end rounded-xl border border-border bg-card/50 px-4 text-sm font-bold transition-colors hover:bg-card"
          >
            {allSelected ? "إلغاء التحديد" : "تحديد الكل"}
          </button>
        </div>
      </div>

      <ul className="max-h-[420px] divide-y divide-border overflow-y-auto">
        {entries.map((e, idx) => {
          const checked = selectedEntries.has(e.webpage_url);
          return (
            <li
              key={e.webpage_url}
              className={`flex items-center gap-3 p-3 transition-colors ${
                checked ? "bg-[color:var(--brand)]/5" : ""
              }`}
              onClick={() => toggle(e.webpage_url)}
              role="button"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(e.webpage_url)}
                onClick={(ev) => ev.stopPropagation()}
                className="h-4 w-4 shrink-0 accent-[color:var(--brand)]"
              />
              <span className="w-6 shrink-0 text-center text-xs text-muted-foreground">
                {idx + 1}
              </span>
              {e.thumbnail && (
                <img
                  src={e.thumbnail}
                  alt=""
                  loading="lazy"
                  className="h-12 w-20 shrink-0 rounded-md object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{e.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {formatDuration(e.duration)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">{selectedEntries.size}</span> من {entries.length} محدد
          {totalSize > 0 && (
            <>
              {" "}· الحجم التقريبي:{" "}
              <span className="font-bold text-foreground">{formatBytes(totalSize)}</span>
            </>
          )}
        </div>
        <button
          onClick={onDownload}
          disabled={selectedEntries.size === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-brand px-6 py-3 text-sm font-black text-primary-foreground shadow-glow transition-transform hover:scale-[1.01] disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          تنزيل المحدد
        </button>
      </div>
    </div>
  );
}
