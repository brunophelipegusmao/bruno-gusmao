import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL("https://brunogusmao.dev"),
  title: {
    default: "Bruno Gusmão — Desenvolvedor Full-Stack",
    template: "%s | Bruno Gusmão",
  },
  description:
    "Portfólio de Bruno Gusmão — desenvolvedor full-stack focado em soluções modernas com NestJS, Next.js e TypeScript.",
  keywords: [
    "desenvolvedor full-stack",
    "NestJS",
    "Next.js",
    "TypeScript",
    "React",
    "portfólio",
  ],
  authors: [{ name: "Bruno Gusmão", url: "https://brunogusmao.dev" }],
  creator: "Bruno Gusmão",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://brunogusmao.dev",
    siteName: "Bruno Gusmão",
    title: "Bruno Gusmão — Desenvolvedor Full-Stack",
    description:
      "Portfólio de Bruno Gusmão — desenvolvedor full-stack focado em soluções modernas.",
    images: [
      { url: "/og-image.png", width: 1200, height: 630, alt: "Bruno Gusmão" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bruno Gusmão — Desenvolvedor Full-Stack",
    description: "Portfólio de Bruno Gusmão.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/splash_screens/icon.png",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={cn("h-full antialiased w-full", "font-sans", geist.variable)}
    >
      <head>
        {/* Apple PWA splash screens */}
        {/* iPhone 17 Pro Max / 16 Pro Max — 1320×2868 @3x → 440×956 CSS */}
        <link rel="apple-touch-startup-image" href="/splash_screens/iPhone_17_Pro_Max__iPhone_16_Pro_Max_portrait.png" media="(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash_screens/iPhone_17_Pro_Max__iPhone_16_Pro_Max_landscape.png" media="(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" />
        {/* iPhone 17 Pro / 17 / 16 Pro — 1206×2622 @3x → 402×874 CSS */}
        <link rel="apple-touch-startup-image" href="/splash_screens/iPhone_17_Pro__iPhone_17__iPhone_16_Pro_portrait.png" media="(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash_screens/iPhone_17_Pro__iPhone_17__iPhone_16_Pro_landscape.png" media="(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" />
        {/* iPhone 17e / 16e / 14 / 13 Pro / 13 / 12 Pro / 12 — 1170×2532 @3x → 390×844 CSS */}
        <link rel="apple-touch-startup-image" href="/splash_screens/iPhone_17e__iPhone_16e__iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_portrait.png" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash_screens/iPhone_17e__iPhone_16e__iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_landscape.png" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" />
        {/* iPhone Air — 1260×2736 @3x → 420×912 CSS */}
        <link rel="apple-touch-startup-image" href="/splash_screens/iPhone_Air_portrait.png" media="(device-width: 420px) and (device-height: 912px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash_screens/iPhone_Air_landscape.png" media="(device-width: 420px) and (device-height: 912px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" />
        {/* iPhone 16 Plus / 15 Pro Max / 15 Plus / 14 Pro Max — 1290×2796 @3x → 430×932 CSS */}
        <link rel="apple-touch-startup-image" href="/splash_screens/iPhone_16_Plus__iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_portrait.png" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash_screens/iPhone_16_Plus__iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_landscape.png" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" />
        {/* iPhone 16 / 15 Pro / 15 / 14 Pro — 1179×2556 @3x → 393×852 CSS */}
        <link rel="apple-touch-startup-image" href="/splash_screens/iPhone_16__iPhone_15_Pro__iPhone_15__iPhone_14_Pro_portrait.png" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash_screens/iPhone_16__iPhone_15_Pro__iPhone_15__iPhone_14_Pro_landscape.png" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" />
        {/* iPhone 14 Plus / 13 Pro Max / 12 Pro Max — 1284×2778 @3x → 428×926 CSS */}
        <link rel="apple-touch-startup-image" href="/splash_screens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_portrait.png" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash_screens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_landscape.png" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" />
        {/* iPhone 11 Pro Max / XS Max — 1242×2688 @3x → 414×896 CSS */}
        <link rel="apple-touch-startup-image" href="/splash_screens/iPhone_11_Pro_Max__iPhone_XS_Max_portrait.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash_screens/iPhone_11_Pro_Max__iPhone_XS_Max_landscape.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" />
        {/* iPhone 11 / XR — 828×1792 @2x → 414×896 CSS */}
        <link rel="apple-touch-startup-image" href="/splash_screens/iPhone_11__iPhone_XR_portrait.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash_screens/iPhone_11__iPhone_XR_landscape.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" />
        {/* iPhone 13 mini / 12 mini / 11 Pro / XS / X — 1125×2436 @3x → 375×812 CSS */}
        <link rel="apple-touch-startup-image" href="/splash_screens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_portrait.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash_screens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_landscape.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" />
        {/* iPhone 8 Plus / 7 Plus / 6s Plus / 6 Plus — 1242×2208 @3x → 414×736 CSS */}
        <link rel="apple-touch-startup-image" href="/splash_screens/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_portrait.png" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash_screens/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_landscape.png" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" />
        {/* iPhone 8 / 7 / 6s / 6 / 4.7" SE — 750×1334 @2x → 375×667 CSS */}
        <link rel="apple-touch-startup-image" href="/splash_screens/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_portrait.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash_screens/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_landscape.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" />
        {/* iPhone 4" SE / iPod touch — 640×1136 @2x → 320×568 CSS */}
        <link rel="apple-touch-startup-image" href="/splash_screens/4__iPhone_SE__iPod_touch_5th_generation_and_later_portrait.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash_screens/4__iPhone_SE__iPod_touch_5th_generation_and_later_landscape.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" />
        {/* iPad 13" Pro M4 — 2064×2752 @2x → 1032×1376 CSS */}
        <link rel="apple-touch-startup-image" href="/splash_screens/13__iPad_Pro_M4_portrait.png" media="(device-width: 1032px) and (device-height: 1376px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash_screens/13__iPad_Pro_M4_landscape.png" media="(device-width: 1032px) and (device-height: 1376px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" />
        {/* iPad 12.9" Pro — 2048×2732 @2x → 1024×1366 CSS */}
        <link rel="apple-touch-startup-image" href="/splash_screens/12.9__iPad_Pro_portrait.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash_screens/12.9__iPad_Pro_landscape.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" />
        {/* iPad 11" Pro M4 — 1668×2420 @2x → 834×1210 CSS */}
        <link rel="apple-touch-startup-image" href="/splash_screens/11__iPad_Pro_M4_portrait.png" media="(device-width: 834px) and (device-height: 1210px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash_screens/11__iPad_Pro_M4_landscape.png" media="(device-width: 834px) and (device-height: 1210px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" />
        {/* iPad 11" Pro / 10.5" Pro — 1668×2388 @2x → 834×1194 CSS */}
        <link rel="apple-touch-startup-image" href="/splash_screens/11__iPad_Pro__10.5__iPad_Pro_portrait.png" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash_screens/11__iPad_Pro__10.5__iPad_Pro_landscape.png" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" />
        {/* iPad 10.9" Air — 1640×2360 @2x → 820×1180 CSS */}
        <link rel="apple-touch-startup-image" href="/splash_screens/10.9__iPad_Air_portrait.png" media="(device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash_screens/10.9__iPad_Air_landscape.png" media="(device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" />
        {/* iPad 10.5" Air — 1668×2224 @2x → 834×1112 CSS */}
        <link rel="apple-touch-startup-image" href="/splash_screens/10.5__iPad_Air_portrait.png" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash_screens/10.5__iPad_Air_landscape.png" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" />
        {/* iPad 10.2" — 1620×2160 @2x → 810×1080 CSS */}
        <link rel="apple-touch-startup-image" href="/splash_screens/10.2__iPad_portrait.png" media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash_screens/10.2__iPad_landscape.png" media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" />
        {/* 9.7" iPad Pro / 7.9" iPad mini / 9.7" iPad Air / 9.7" iPad — 1536×2048 @2x → 768×1024 CSS */}
        <link rel="apple-touch-startup-image" href="/splash_screens/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_portrait.png" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash_screens/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_landscape.png" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" />
        {/* iPad 8.3" Mini — 1488×2266 @2x → 744×1133 CSS */}
        <link rel="apple-touch-startup-image" href="/splash_screens/8.3__iPad_Mini_portrait.png" media="(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash_screens/8.3__iPad_Mini_landscape.png" media="(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" />
      </head>
      <body className="min-h-screen flex flex-col items-center">
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.1}
          duration={3}
          repeatDelay={1}
          className={cn(
            "mask-[radial-gradient(800px_circle_at_center,white,transparent)]",
            // "inset-x-0 inset-y-[-30%] min-h-screen min-w-screen skew-y-12",
          )}
        />
        <div className="w-full sm:min-w-[85%] md:min-w-[80%] max-h-screen">
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
