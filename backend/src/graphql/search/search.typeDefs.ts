export const searchTypeDefs = /* GraphQL */ `
  # =========================
  # Search Queries (PUBLIC - guests can search)
  # =========================

  extend type Query {
    # Search users by username/name
    searchUsers(query: String!, first: Int = 20, after: String): UserConnection!

    # Search posts by content
    searchPosts(query: String!, first: Int = 20, after: String): PostConnection!

    # Search hashtags
    searchHashtags(query: String!, first: Int = 20): [Hashtag!]!

    # Get trending hashtags
    getTrendingHashtags(first: Int = 10): [Hashtag!]!
  }
`;
