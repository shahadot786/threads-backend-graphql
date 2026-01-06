"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function AuthCard() {
  return (
    <div className="w-[360px] bg-[#181818] rounded-[24px] border border-[rgba(243,245,247,0.15)] p-6 flex flex-col gap-3 shadow-lg">
      <div className="flex flex-col gap-1">
        <h2 className="text-[17px] font-bold text-white leading-snug">
          Log in or sign up for Threads
        </h2>
        <p className="text-[#777777] text-[15px] leading-snug">
          See what people are talking about and join the conversation.
        </p>
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <Link href="/login" className="block w-full">
          <Button className="w-full text-white bg-black border border-[rgba(243,245,247,0.15)] h-[52px] rounded-[16px] font-bold text-[15px] hover:bg-[#262626] transition-colors">
            Log in
          </Button>
        </Link>

        <div className="flex justify-center -mt-1">
          <Link href="/login" className="text-[13px] text-[#777777] hover:underline font-normal">
            Log in with username instead
          </Link>
        </div>
      </div>
    </div>
  );
}
