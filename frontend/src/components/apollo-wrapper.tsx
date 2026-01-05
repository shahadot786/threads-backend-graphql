"use client";

import { ApolloProvider } from "@/lib/apollo-client";
import { ReactNode } from "react";

export function ApolloWrapper({ children }: { children: ReactNode }) {
  return <ApolloProvider>{children}</ApolloProvider>;
}
