import { gql } from '@apollo/client/core';

// ========================
// USER FRAGMENT
// ========================

export const USER_FRAGMENT = gql`
  fragment UserFields on User {
    id
    email
    firstName
    lastName
    username
    profileImageUrl
    is_verified
    is_private
    bio
    website
    location
    stats {
      followersCount
      followingCount
      postsCount
    }
    createdAt
    updatedAt
  }
`;

export const USER_BASIC_FRAGMENT = gql`
  fragment UserBasicFields on User {
    id
    firstName
    lastName
    username
    profileImageUrl
    is_verified
  }
`;

// ========================
// POST FRAGMENT
// ========================

export const POST_FRAGMENT = gql`
  fragment PostFields on Post {
    id
    content
    visibility
    repliesCount
    likesCount
    repostsCount
    isLiked
    isBookmarked
    isReposted
    createdAt
    updatedAt
    author {
      ...UserBasicFields
    }
    repostedBy {
      id
      username
      profileImageUrl
    }
    media {
      id
      mediaType
      mediaUrl
      position
    }
    hashtags {
      id
      tag
      usageCount
    }
    mentions {
      id
      username
    }
    parentPost {
      id
      author {
        ...UserBasicFields
      }
    }
  }
  ${USER_BASIC_FRAGMENT}
`;

// ========================
// PAGE INFO FRAGMENT
// ========================

export const PAGE_INFO_FRAGMENT = gql`
  fragment PageInfoFields on PageInfo {
    hasNextPage
    endCursor
  }
`;
