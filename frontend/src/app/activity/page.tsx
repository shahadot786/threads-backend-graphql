"use client";

import { useQuery } from "@apollo/client/react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { LoadingSpinner } from "@/components/ui/Loading";
import { useAuthStore } from "@/stores/auth";
import { GET_MY_NOTIFICATIONS } from "@/graphql/queries/user";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Notification } from "@/types";
import { UserTooltip } from "@/components/common/UserTooltip";

interface NotificationsData {
  getMyNotifications: Notification[];
}

const notificationText: Record<string, string> = {
  LIKE: "liked your thread",
  REPLY: "replied to your thread",
  FOLLOW: "started following you",
  MENTION: "mentioned you",
  REPOST: "reposted your thread",
};

export default function ActivityPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const { data, loading: notificationsLoading } = useQuery<NotificationsData>(
    GET_MY_NOTIFICATIONS,
    { skip: !isAuthenticated }
  );

  const notifications = data?.getMyNotifications || [];

  if (isLoading) {
    return (
      <MainLayout showAuthCard={false}>
        <Header title="Activity" />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MainLayout showAuthCard={false}>
      <Header title="Activity" />

      <div className="pb-20 md:pb-4">
        {notificationsLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center animate-fade-in">
            <p className="text-foreground font-medium">No activity yet</p>
            <p className="text-muted-foreground text-sm mt-1">
              When someone interacts with your threads, you&apos;ll see it here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/10">
            {notifications.map((notification) => {
              const mainLinkHref = notification.entityId ? `/post/${notification.entityId}` : `/@${notification.actor.username}`;

              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 px-4 py-4 hover:bg-muted/40 transition-all relative group ${!notification.isRead ? 'bg-primary/5' : ''}`}
                >
                  {/* Main clickable area for the row */}
                  <Link href={mainLinkHref} className="absolute inset-0 z-0" aria-label="View activity" />

                  {/* Avatar with Tooltip - z-10 to sit above main link */}
                  <div className="z-10 relative">
                    <UserTooltip user={notification.actor}>
                      <Link href={`/@${notification.actor.username}`}>
                        <Avatar className="w-11 h-11 border border-border/50 translate-y-0.5">
                          <AvatarImage src={notification.actor.profileImageUrl || ""} alt={notification.actor.username} />
                          <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                            {notification.actor.firstName[0]}{notification.actor.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                    </UserTooltip>
                  </div>

                  <div className="flex-1 min-w-0 z-10 relative pointer-events-none">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <UserTooltip user={notification.actor}>
                        <Link href={`/@${notification.actor.username}`} className="font-bold text-foreground text-[15px] hover:underline pointer-events-auto">
                          {notification.actor.username}
                        </Link>
                      </UserTooltip>

                      <span className="text-muted-foreground text-[15px]">{notificationText[notification.type]}</span>

                      <span className="text-muted-foreground text-[14px] ml-auto md:ml-0">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary mt-3 shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
