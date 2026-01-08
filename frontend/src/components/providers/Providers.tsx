"use client";

import { ApolloProvider } from "@/lib/apollo-client";
import { ThemeProvider } from "./ThemeProvider";
import { SocketProvider } from "@/lib/socket-context";
import { ReplyModal } from "@/components/post/ReplyModal";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { Toast } from "@/components/ui/Toast";
import { AlertModal } from "@/components/ui/AlertModal";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider>
      <ThemeProvider>
        <SocketProvider>
          {children}
          <ReplyModal />
          <EditProfileModal />
          <AlertModal />
          <Toast />
        </SocketProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}
