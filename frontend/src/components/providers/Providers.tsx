"use client";

import { ApolloProvider } from "@/lib/apollo-client";
import { ThemeProvider } from "./ThemeProvider";
import { CreatePostModal } from "@/components/post/CreatePost";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider>
      <ThemeProvider>
        {children}
        <CreatePostModal />
      </ThemeProvider>
    </ApolloProvider>
  );
}
