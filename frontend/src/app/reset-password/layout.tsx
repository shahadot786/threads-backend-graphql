import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | Threads Clone",
  description: "Create a new password for your Threads Clone account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
