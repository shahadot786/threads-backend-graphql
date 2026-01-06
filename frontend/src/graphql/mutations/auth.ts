import { gql } from '@apollo/client/core';
import { USER_FRAGMENT } from '../fragments';

// ========================
// AUTH MUTATIONS
// ========================

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      user {
        ...UserFields
      }
    }
  }
  ${USER_FRAGMENT}
`;

export const REGISTER_MUTATION = gql`
  mutation Register(
    $firstName: String!
    $lastName: String
    $username: String
    $email: String!
    $password: String!
  ) {
    createUser(
      firstName: $firstName
      lastName: $lastName
      username: $username
      email: $email
      password: $password
    ) {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken {
    refreshToken {
      accessToken
      user {
        ...UserFields
      }
    }
  }
  ${USER_FRAGMENT}
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export const LOGOUT_ALL_MUTATION = gql`
  mutation LogoutAll {
    logoutAll
  }
`;

// ========================
// USER MUTATIONS
// ========================

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

export const FOLLOW_USER_MUTATION = gql`
  mutation FollowUser($userId: ID!) {
    followUser(userId: $userId)
  }
`;

export const UNFOLLOW_USER_MUTATION = gql`
  mutation UnfollowUser($userId: ID!) {
    unfollowUser(userId: $userId)
  }
`;
