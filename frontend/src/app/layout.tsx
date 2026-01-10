import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Threads Clone | Social Sharing Platform",
  description:
    "A modern social media platform for sharing thoughts, connecting with friends, and discovering trending content. Built with Next.js, GraphQL, and PostgreSQL.",
  keywords: [
    "threads",
    "social media",
    "posts",
    "community",
    "sharing",
    "connect",
    "threads clone",
    "social network",
  ],
  authors: [{ name: "Shahadot Hossain", url: "https://github.com/shahadot786" }],
  creator: "Shahadot Hossain",
  metadataBase: new URL("https://threads-clone-three-nu.vercel.app"),
  openGraph: {
    title: "Threads Clone | Social Sharing Platform",
    description:
      "Share your thoughts, follow friends, and discover trending posts on Threads Clone.",
    type: "website",
    url: "https://threads-clone-three-nu.vercel.app",
    siteName: "Threads Clone",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Threads Clone - Social Sharing Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Threads Clone | Social Sharing Platform",
    description:
      "Share your thoughts, follow friends, and discover trending posts.",
    images: ["/og-image.png"],
    creator: "@shahadot786",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#101010" },
  ],
  verification: {
    google: "a-5BJSKJLu9OAQmVs_PhfvWCYxISpzm2IeOnCywvN_0",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <JsonLd />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
