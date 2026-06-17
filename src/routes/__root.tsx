import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import logo from "../assets/logo.png.asset.json";

const SITE_TITLE = "Url Downloader — تنزيل فيديوهات يوتيوب وتيك توك وفيسبوك وإنستجرام بدون علامة مائية";
const SITE_DESC =
  "حمّل فيديوهات يوتيوب، تيك توك، فيسبوك، وإنستجرام بأعلى جودة وبدون علامة مائية. أسرع وأسهل أداة تنزيل عربية، تعمل كتطبيق PWA على هاتفك.";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-black text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-bold">الصفحة غير موجودة</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          الرابط اللي حاولت تفتحه مش موجود أو تم نقله.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-brand px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-105"
        >
          الرجوع للرئيسية
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-bold">حدث خطأ غير متوقع</h1>
        <p className="mt-2 text-sm text-muted-foreground">حاول إعادة تحميل الصفحة.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-bold text-primary-foreground"
          >
            إعادة المحاولة
          </button>
          <a href="/" className="rounded-xl border border-border px-5 py-2.5 text-sm font-bold">
            الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
      },
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESC },
      { name: "author", content: "Youssif Khalid" },
      { name: "keywords", content: "تنزيل فيديوهات, تحميل من يوتيوب, تحميل تيك توك بدون علامة مائية, تحميل انستجرام, تحميل فيسبوك, url downloader, video downloader, youtube downloader, tiktok downloader" },
      { name: "theme-color", content: "#0b1020" },
      { name: "application-name", content: "Url Downloader" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Url Downloader" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "format-detection", content: "telephone=no" },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: SITE_DESC },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "ar_EG" },
      { property: "og:image", content: logo.url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE_TITLE },
      { name: "twitter:description", content: SITE_DESC },
      { name: "twitter:image", content: logo.url },
      { title: "Lovable App" },
      { property: "og:title", content: "Lovable App" },
      { name: "twitter:title", content: "Lovable App" },
      { name: "description", content: "TubeSave Pro downloads videos from YouTube, TikTok, Facebook, and Instagram without watermarks in high quality." },
      { property: "og:description", content: "TubeSave Pro downloads videos from YouTube, TikTok, Facebook, and Instagram without watermarks in high quality." },
      { name: "twitter:description", content: "TubeSave Pro downloads videos from YouTube, TikTok, Facebook, and Instagram without watermarks in high quality." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3db4b12a-bceb-4476-b935-15bda69df7cf/id-preview-bdabd58b--a148c39b-0832-428d-93ee-5540037f65ef.lovable.app-1781701028225.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3db4b12a-bceb-4476-b935-15bda69df7cf/id-preview-bdabd58b--a148c39b-0832-428d-93ee-5540037f65ef.lovable.app-1781701028225.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", type: "image/png", href: logo.url },
      { rel: "apple-touch-icon", href: logo.url },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cairo:wght@500;700;800;900&family=Tajawal:wght@400;500;700;800&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Url Downloader",
          inLanguage: "ar",
          description: SITE_DESC,
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Any",
          author: { "@type": "Person", name: "Youssif Khalid" },
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
