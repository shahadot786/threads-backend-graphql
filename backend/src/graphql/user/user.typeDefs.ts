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
    isFollowing: Boolean!
  }

  type UserStats {
    followersCount: Int!
    followingCount: Int!
    postsCount: Int!
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
  # Notifications
  # =========================

  enum NotificationType {
    LIKE
    REPLY
    FOLLOW
    MENTION
    REPOST
  }

  type Notification {
    id: ID!
    user: User!
    actor: User!
    type: NotificationType!
    entityId: ID
    isRead: Boolean!
    createdAt: String!
  }

  # =========================
  # Pagination
  # =========================

  type UserEdge {
    cursor: String!
    node: User!
  }

  type UserConnection {
    edges: [UserEdge!]!
    pageInfo: PageInfo!
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

  extend type Query {
    # User queries
    getUsers: [User!]!
    getUserById(id: ID!): User
    getUserByUsername(username: String!): User
    getUserByEmail(email: String): User
    getCurrentLoggedInUser: User
    getSuggestedUsers(first: Int): [User!]!

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

  extend type Mutation {
    # User Profile Creation (After Supabase Auth SignUp)
    createUser(
      firstName: String!
      lastName: String
      username: String
      profileImageUrl: String
      email: String!
    ): User!

    updateUserProfile(input: UpdateUserProfileInput!): User!

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
