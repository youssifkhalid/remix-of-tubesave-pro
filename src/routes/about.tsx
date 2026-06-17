import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png.asset.json";
import {
  ArrowRight,
  Facebook,
  Instagram,
  MessageCircle,
  Music2,
  Phone,
  Send,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "عن المطور — Youssif Khalid · Url Downloader" },
      {
        name: "description",
        content:
          "تعرّف على Youssif Khalid، مطوّر تطبيق Url Downloader. تواصل معه عبر واتساب، إنستجرام، تيك توك، تيليجرام، وفيسبوك.",
      },
    ],
  }),
  component: AboutPage,
});

const USER = "joo_1698";
const WHATSAPP = "+201092812463";
const links = [
  {
    label: "واتساب",
    handle: WHATSAPP,
    href: `https://wa.me/${WHATSAPP.replace(/[^0-9]/g, "")}`,
    icon: <Phone className="h-5 w-5" />,
  },
  {
    label: "إنستجرام",
    handle: `@${USER}`,
    href: `https://instagram.com/${USER}`,
    icon: <Instagram className="h-5 w-5" />,
  },
  {
    label: "تيك توك",
    handle: `@${USER}`,
    href: `https://tiktok.com/@${USER}`,
    icon: <Music2 className="h-5 w-5" />,
  },
  {
    label: "تيليجرام",
    handle: `@${USER}`,
    href: `https://t.me/${USER}`,
    icon: <Send className="h-5 w-5" />,
  },
  {
    label: "فيسبوك",
    handle: USER,
    href: `https://facebook.com/${USER}`,
    icon: <Facebook className="h-5 w-5" />,
  },
];

function AboutPage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-8 sm:px-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowRight className="h-4 w-4" />
        الرجوع للرئيسية
      </Link>

      <section className="mt-8 text-center">
        <div className="mx-auto inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-brand p-4 shadow-glow">
          <img src={logo.url} alt="" width={64} height={64} className="h-16 w-16" />
        </div>
        <h1 className="mt-5 text-3xl font-black sm:text-4xl">Youssif Khalid</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          مطوّر تطبيق <span className="font-bold text-foreground">Url Downloader</span> — أداة عربية
          لتنزيل الفيديوهات بأعلى جودة.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="glass group flex items-center gap-4 rounded-2xl p-4 transition-transform hover:scale-[1.01]"
          >
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
              {l.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black">{l.label}</p>
              <p dir="ltr" className="truncate text-right text-xs text-muted-foreground">
                {l.handle}
              </p>
            </div>
            <span className="text-xs font-bold text-[color:var(--brand)] opacity-0 transition-opacity group-hover:opacity-100">
              زيارة
            </span>
          </a>
        ))}
      </section>

      <p className="mt-12 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Url Downloader — جميع الحقوق محفوظة.
      </p>
    </main>
  );
}
