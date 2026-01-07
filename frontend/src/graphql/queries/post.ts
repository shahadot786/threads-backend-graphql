import { gql } from '@apollo/client/core';
import { POST_FRAGMENT, PAGE_INFO_FRAGMENT } from '../fragments';

// ========================
// POST QUERIES
// ========================

export const GET_POST_BY_ID = gql`
  query GetPostById($id: ID!) {
    getPostById(id: $id) {
      ...PostFields
    }
  }
  ${POST_FRAGMENT}
`;

export const GET_POST_REPLIES = gql`
  query GetPostReplies($postId: ID!, $first: Int, $after: String) {
    getPostReplies(postId: $postId, first: $first, after: $after) {
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

export const GET_USER_POSTS = gql`
  query GetUserPosts($userId: ID!, $filter: PostFilter, $first: Int, $after: String) {
    getUserPosts(userId: $userId, filter: $filter, first: $first, after: $after) {
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

export const GET_HOME_FEED = gql`
  query GetHomeFeed($first: Int, $after: String) {
    getHomeFeed(first: $first, after: $after) {
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

export const GET_TRENDING_POSTS = gql`
  query GetTrendingPosts($first: Int, $after: String) {
    getTrendingPosts(first: $first, after: $after) {
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

export const GET_PUBLIC_FEED = gql`
  query GetPublicFeed($first: Int, $after: String) {
    getPublicFeed(first: $first, after: $after) {
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

export const GET_POSTS_BY_HASHTAG = gql`
  query GetPostsByHashtag($tag: String!, $first: Int, $after: String) {
    getPostsByHashtag(tag: $tag, first: $first, after: $after) {
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

export const GET_MY_BOOKMARKS = gql`
  query GetMyBookmarks($first: Int, $after: String) {
    getMyBookmarks(first: $first, after: $after) {
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
