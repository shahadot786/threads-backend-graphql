import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search | Threads Clone",
  description: "Search for users, posts, and trending content on Threads Clone. Discover new people to follow and topics to explore.",
  openGraph: {
    title: "Search | Threads Clone",
    description: "Find users and posts on Threads Clone",
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
