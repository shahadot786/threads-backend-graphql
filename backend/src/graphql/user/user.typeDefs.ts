export const userTypeDefs = /* GraphQL */ `
  # =========================
  # Core User Types
  # =========================

  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String
    username: String!
    profileImageUrl: String
    is_verified: Boolean
    is_private: Boolean
    status: String
    bio: String
    website: String
    location: String
    dob: String
    stats: UserStats
    createdAt: String!
    updatedAt: String!
  }

  type UserStats {
    followersCount: Int!
    followingCount: Int!
    postsCount: Int!
  }

  # =========================
  # Auth Types
  # =========================

  type AuthResponse {
    accessToken: String!
    user: User!
  }

  # =========================
  # Follow System
  # =========================

  type Follow {
    follower: User!
    following: User!
    createdAt: String!
  }

  # =========================
  # Block System
  # =========================

  type Block {
    blocker: User!
    blocked: User!
    createdAt: String!
  }

  # =========================
  # Notifications (User-facing)
  # =========================

  enum NotificationType {
    LIKE
    REPLY
    FOLLOW
    MENTION
  }

  type Notification {
    id: ID!
    user: User! # receiver
    actor: User! # who triggered it
    type: NotificationType!
    entityId: ID
    isRead: Boolean!
    createdAt: String!
  }

  # =========================
  # Input Types
  # =========================

  input UpdateUserProfileInput {
    firstName: String
    lastName: String
    username: String
    bio: String
    website: String
    location: String
    dob: String
    profileImageUrl: String
    is_private: Boolean
  }

  # =========================
  # Queries
  # =========================

  type Query {
    # User queries
    getUsers: [User!]!
    getUserById(id: ID!): User
    getUserByUsername(username: String!): User
    getUserByEmail(email: String): User
    getCurrentLoggedInUser: User

    # Follow queries
    getFollowers(userId: ID!): [User!]!
    getFollowing(userId: ID!): [User!]!

    # Block queries
    getBlockedUsers: [User!]!

    # Notifications
    getMyNotifications: [Notification!]!
  }

  # =========================
  # Mutations
  # =========================

  type Mutation {
    # User
    createUser(
      firstName: String!
      lastName: String
      username: String
      profileImageUrl: String
      email: String!
      password: String!
    ): User!

    updateUserProfile(input: UpdateUserProfileInput!): User!

    # Auth
    login(email: String!, password: String!): AuthResponse!
    refreshToken: AuthResponse!
    logout: Boolean!
    logoutAll: Boolean!

    # Follow
    followUser(userId: ID!): Boolean!
    unfollowUser(userId: ID!): Boolean!

    # Block
    blockUser(userId: ID!): Boolean!
    unblockUser(userId: ID!): Boolean!

    # Notifications
    markNotificationAsRead(notificationId: ID!): Boolean!
    markAllNotificationsAsRead: Boolean!
  }
`;
