import { gql } from '@apollo/client/core';
import { POST_FRAGMENT } from '../fragments';

// ========================
// POST MUTATIONS
// ========================

export const CREATE_POST_MUTATION = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      ...PostFields
    }
  }
  ${POST_FRAGMENT}
`;

export const UPDATE_POST_MUTATION = gql`
  mutation UpdatePost($postId: ID!, $input: UpdatePostInput!) {
    updatePost(postId: $postId, input: $input) {
      ...PostFields
    }
  }
  ${POST_FRAGMENT}
`;

export const DELETE_POST_MUTATION = gql`
  mutation DeletePost($postId: ID!) {
    deletePost(postId: $postId)
  }
`;

export const REPLY_TO_POST_MUTATION = gql`
  mutation ReplyToPost($parentPostId: ID!, $content: String!) {
    replyToPost(parentPostId: $parentPostId, content: $content) {
      ...PostFields
    }
  }
  ${POST_FRAGMENT}
`;

export const LIKE_POST_MUTATION = gql`
  mutation LikePost($postId: ID!) {
    likePost(postId: $postId)
  }
`;

export const UNLIKE_POST_MUTATION = gql`
  mutation UnlikePost($postId: ID!) {
    unlikePost(postId: $postId)
  }
`;

export const BOOKMARK_POST_MUTATION = gql`
  mutation BookmarkPost($postId: ID!) {
    bookmarkPost(postId: $postId)
  }
`;

export const UNBOOKMARK_POST_MUTATION = gql`
  mutation UnbookmarkPost($postId: ID!) {
    unbookmarkPost(postId: $postId)
  }
`;

export const REPOST_POST_MUTATION = gql`
  mutation RepostPost($postId: ID!) {
    repostPost(postId: $postId)
  }
`;

export const UNREPOST_POST_MUTATION = gql`
  mutation UnrepostPost($postId: ID!) {
    unrepostPost(postId: $postId)
  }
`;
