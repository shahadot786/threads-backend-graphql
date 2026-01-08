import { gql } from '@apollo/client/core';
import { USER_BASIC_FRAGMENT, POST_FRAGMENT, PAGE_INFO_FRAGMENT, USER_FRAGMENT } from '../fragments';

// ========================
// SEARCH QUERIES
// ========================

export const SEARCH_USERS = gql`
  query SearchUsers($query: String!, $first: Int, $after: String) {
    searchUsers(query: $query, first: $first, after: $after) {
      edges {
        cursor
        node {
          ...UserFields
        }
      }
      pageInfo {
        ...PageInfoFields
      }
    }
  }
  ${USER_FRAGMENT}
  ${PAGE_INFO_FRAGMENT}
`;

export const GET_SUGGESTED_USERS = gql`
  query GetSuggestedUsers($first: Int) {
  getSuggestedUsers(first: $first) {
    id
    username
    firstName
    lastName
    profileImageUrl
    is_verified
    isFollowing
      stats {
      followersCount
      postsCount
    }
  }
}
`;

export const SEARCH_POSTS = gql`
  query SearchPosts($query: String!, $first: Int, $after: String) {
  searchPosts(query: $query, first: $first, after: $after) {
      edges {
      cursor
        node {
          ...PostFields
      }
    }
      pageInfo {
        ...PageInfoFields
    }
  }
}
  ${POST_FRAGMENT}
  ${PAGE_INFO_FRAGMENT}
`;

export const SEARCH_HASHTAGS = gql`
  query SearchHashtags($query: String!, $first: Int) {
  searchHashtags(query: $query, first: $first) {
    id
    tag
    usageCount
  }
}
`;

export const GET_TRENDING_HASHTAGS = gql`
  query GetTrendingHashtags($first: Int) {
  getTrendingHashtags(first: $first) {
    id
    tag
    usageCount
  }
}
`;
