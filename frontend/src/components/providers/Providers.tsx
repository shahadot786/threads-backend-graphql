"use client";

import { ApolloProvider } from "@/lib/apollo-client";
import { ThemeProvider } from "./ThemeProvider";
import { CreatePostModal } from "@/components/post/CreatePost";
import { ReplyModal } from "@/components/post/ReplyModal";
import { Toast } from "@/components/ui/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider>
      <ThemeProvider>
        {children}
        <CreatePostModal />
        <ReplyModal />
        <Toast />
      </ThemeProvider>
    </ApolloProvider>
  );
}
