import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function AuthCard() {
  return (
    <div className="w-[360px] bg-card rounded-[32px] border border-border p-7 flex flex-col gap-4 shadow-xl animate-scale-in">
      <div className="flex flex-col gap-2">
        <h2 className="text-[19px] font-extrabold text-foreground leading-snug">
          Log in or sign up for Threads
        </h2>
        <p className="text-muted-foreground text-[15px] leading-relaxed">
          See what people are talking about and join the conversation.
        </p>
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <Link href="/login" className="block w-full">
          <Button variant="outline" className="w-full h-[52px] rounded-2xl font-bold text-[15px] text-foreground border-border hover:bg-muted transition-all active:scale-95">
            Log in
          </Button>
        </Link>

        <div className="flex justify-center">
          <Link href="/login" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors font-normal">
            Log in with username instead
          </Link>
        </div>
      </div>
    </div>
  );
}
