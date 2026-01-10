import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email | Threads Clone",
  description: "Verify your email address to complete your Threads Clone registration.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
