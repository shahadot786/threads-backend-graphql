export const postTypeDefs = /* GraphQL */ `
  # =========================
  # Enums
  # =========================

  enum PostVisibility {
    PUBLIC
    FOLLOWERS
    PRIVATE
  }

  enum MediaType {
    IMAGE
    VIDEO
    GIF
  }

  enum PostFilter {
    THREADS
    REPLIES
    REPOSTS
  }

  # =========================
  # Core Post Types
  # =========================
  
  # ... (leaving this part out of replacement to minimize size, wait, I need to match context)
  # Actually better to just do the enum block and the query block separately or carefully.

  # Let's do the enum first.


  # =========================
  # Core Post Types
  # =========================

  type Post {
    id: ID!
    author: User!
    content: String
    visibility: PostVisibility!
    parentPost: Post
    repliesCount: Int!
    likesCount: Int!
    repostsCount: Int!
    isLiked: Boolean!
    isBookmarked: Boolean!
    isReposted: Boolean!
    repostedBy: User
    media: [PostMedia!]
    hashtags: [Hashtag!]
    mentions: [User!]
    createdAt: String!
    updatedAt: String!
  }

  # =========================
  # Media
  # =========================

  type PostMedia {
    id: ID!
    mediaType: MediaType!
    mediaUrl: String!
    position: Int
  }

  # =========================
  # Likes
  # =========================

  type PostLike {
    user: User!
    post: Post!
    createdAt: String!
  }

  # =========================
  # Bookmarks
  # =========================

  type Bookmark {
    user: User!
    post: Post!
    createdAt: String!
  }

  # =========================
  # Hashtags
  # =========================

  type Hashtag {
    id: ID!
    tag: String!
    usageCount: Int!
  }

  # =========================
  # Pagination
  # =========================

  type PostEdge {
    cursor: String!
    node: Post!
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String
  }

  type PostConnection {
    edges: [PostEdge!]!
    pageInfo: PageInfo!
  }

  # =========================
  # Input Types
  # =========================

  input CreatePostInput {
    content: String
    visibility: PostVisibility = PUBLIC
    media: [CreatePostMediaInput!]
  }

  input CreatePostMediaInput {
    mediaType: MediaType!
    mediaUrl: String!
    position: Int
  }

  input UpdatePostInput {
    content: String
    visibility: PostVisibility
  }

  # =========================
  # Queries
  # =========================

  extend type Query {
    # Single post (PUBLIC - guests can view)
    getPostById(id: ID!): Post

    # Thread + replies (PUBLIC - guests can view)
    getPostReplies(postId: ID!, first: Int = 20, after: String): PostConnection!

    # User posts (PUBLIC - respects privacy settings)
    getUserPosts(userId: ID!, filter: PostFilter = THREADS, first: Int = 20, after: String): PostConnection!

    # Home feed (PROTECTED - authenticated users only)
    getHomeFeed(first: Int = 20, after: String): PostConnection!

    # Explore / trending (PUBLIC - guests can view)
    getTrendingPosts(first: Int = 20, after: String): PostConnection!

    # Public feed (PUBLIC - chronological order for guests)
    getPublicFeed(first: Int = 20, after: String): PostConnection!

    # Hashtag search (PUBLIC - guests can view)
    getPostsByHashtag(tag: String!, first: Int = 20, after: String): PostConnection!

    # My bookmarks (PROTECTED)
    getMyBookmarks(first: Int = 20, after: String): PostConnection!
  }

  # =========================
  # Mutations
  # =========================

  extend type Mutation {
    # Posts (PROTECTED)
    createPost(input: CreatePostInput!): Post!
    updatePost(postId: ID!, input: UpdatePostInput!): Post!
    deletePost(postId: ID!): Boolean!

    # Replies (PROTECTED)
    replyToPost(parentPostId: ID!, content: String!): Post!

    # Likes (PROTECTED)
    likePost(postId: ID!): Boolean!
    unlikePost(postId: ID!): Boolean!

    # Bookmarks (PROTECTED)
    bookmarkPost(postId: ID!): Boolean!
    unbookmarkPost(postId: ID!): Boolean!

    # Reposts (PROTECTED)
    repostPost(postId: ID!): Boolean!
    unrepostPost(postId: ID!): Boolean!
  }
`;
