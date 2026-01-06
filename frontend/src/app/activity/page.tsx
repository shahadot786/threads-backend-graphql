"use client";

import { useQuery } from "@apollo/client/react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Avatar } from "@/components/ui/Avatar";
import { useAuthStore } from "@/stores/auth";
import { GET_MY_NOTIFICATIONS } from "@/graphql/queries/user";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Notification } from "@/types";

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
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
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
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-text-secondary">No activity yet</p>
            <p className="text-text-tertiary text-sm mt-1">
              When someone interacts with your threads, you&apos;ll see it here.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <Link
              key={notification.id}
              href={notification.entityId ? `/post/${notification.entityId}` : `/@${notification.actor.username}`}
              className={`flex items-start gap-3 px-4 py-4 hover:bg-hover transition-colors border-b border-border ${!notification.isRead ? 'bg-hover/30' : ''}`}
            >
              <Avatar
                src={notification.actor.profileImageUrl}
                firstName={notification.actor.firstName}
                lastName={notification.actor.lastName}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="text-text-primary">
                  <span className="font-semibold">{notification.actor.username}</span>
                  {" "}
                  <span className="text-text-secondary">{notificationText[notification.type]}</span>
                </p>
                <p className="text-text-tertiary text-sm">
                  {formatRelativeTime(notification.createdAt)}
                </p>
              </div>
              {!notification.isRead && (
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
              )}
            </Link>
          ))
        )}
      </div>
    </MainLayout>
  );
}
