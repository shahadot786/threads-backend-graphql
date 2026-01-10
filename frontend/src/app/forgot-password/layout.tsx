import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Threads Clone",
  description: "Reset your Threads Clone password. Enter your email to receive a password reset link.",
  openGraph: {
    title: "Forgot Password | Threads Clone",
    description: "Reset your password",
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
