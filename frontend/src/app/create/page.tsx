"use client";

import { CreatePost } from "@/components/post/CreatePost";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";

export default function CreatePostPage() {
  const router = useRouter();

  return (
    <MainLayout>
      <div className="w-full max-w-[620px] mx-auto pt-6 px-4">
        <h1 className="text-xl font-bold mb-6">New Thread</h1>
        <div className="bg-background border border-border/40 rounded-xl p-1">
          <CreatePost
            onSuccess={() => router.push("/")}
          />
        </div>
      </div>
    </MainLayout>
  );
}
