import { gql } from '@apollo/client/core';
import { USER_FRAGMENT, USER_BASIC_FRAGMENT } from '../fragments';

// ========================
// USER QUERIES
// ========================

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    getCurrentLoggedInUser {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

export const GET_USER_BY_USERNAME = gql`
  query GetUserByUsername($username: String!) {
    getUserByUsername(username: $username) {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

export const GET_USER_BY_ID = gql`
  query GetUserById($id: ID!) {
    getUserById(id: $id) {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

export const GET_FOLLOWERS = gql`
  query GetFollowers($userId: ID!) {
    getFollowers(userId: $userId) {
      ...UserBasicFields
    }
  }
  ${USER_BASIC_FRAGMENT}
`;

export const GET_FOLLOWING = gql`
  query GetFollowing($userId: ID!) {
    getFollowing(userId: $userId) {
      ...UserBasicFields
    }
  }
  ${USER_BASIC_FRAGMENT}
`;

export const GET_MY_NOTIFICATIONS = gql`
  query GetMyNotifications {
    getMyNotifications {
      id
      type
      entityId
      isRead
      createdAt
      actor {
        ...UserBasicFields
      }
    }
  }
  ${USER_BASIC_FRAGMENT}
`;
