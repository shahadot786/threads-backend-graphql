import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Threads Clone",
  description: "Sign in to your Threads Clone account to share posts, follow friends, and discover trending content.",
  openGraph: {
    title: "Login | Threads Clone",
    description: "Sign in to your Threads Clone account",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
