import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activity | Threads Clone",
  description: "View your notifications and activity on Threads Clone. See who liked, commented, and followed you.",
  openGraph: {
    title: "Activity | Threads Clone",
    description: "Your notifications and activity",
  },
};

export default function ActivityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
