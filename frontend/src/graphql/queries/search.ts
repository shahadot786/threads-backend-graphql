import { gql } from '@apollo/client/core';
import { USER_BASIC_FRAGMENT, POST_FRAGMENT, PAGE_INFO_FRAGMENT } from '../fragments';

// ========================
// SEARCH QUERIES
// ========================

export const SEARCH_USERS = gql`
  query SearchUsers($query: String!, $first: Int, $after: String) {
    searchUsers(query: $query, first: $first, after: $after) {
      edges {
        cursor
        node {
          ...UserBasicFields
          bio
          stats {
            followersCount
            postsCount
          }
        }
      }
      pageInfo {
        ...PageInfoFields
      }
    }
  }
  ${USER_BASIC_FRAGMENT}
  ${PAGE_INFO_FRAGMENT}
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
