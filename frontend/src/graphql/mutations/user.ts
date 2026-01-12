import { gql } from '@apollo/client/core';

export const BLOCK_USER_MUTATION = gql`
  mutation BlockUser($userId: ID!) {
    blockUser(userId: $userId)
  }
`;

export const UNBLOCK_USER_MUTATION = gql`
  mutation UnblockUser($userId: ID!) {
    unblockUser(userId: $userId)
  }
`;

export const FOLLOW_USER_MUTATION = gql`
  mutation FollowUser($userId: ID!) {
    followUser(userId: $userId)
  }
`;

export const UNFOLLOW_USER_MUTATION = gql`
  mutation UnfollowUser($userId: ID!) {
    unfollowUser(userId: $userId)
  }
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead
  }
`;

export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($notificationId: ID!) {
    markNotificationAsRead(notificationId: $notificationId)
  }
`;
