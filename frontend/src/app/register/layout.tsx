import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Threads Clone",
  description: "Create your Threads Clone account today. Join the conversation, share your thoughts, and connect with others.",
  openGraph: {
    title: "Sign Up | Threads Clone",
    description: "Create your account and join the conversation",
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
