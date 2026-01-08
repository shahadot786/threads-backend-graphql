import { gql } from '@apollo/client/core';
import { USER_FRAGMENT } from '../fragments';

/* 
  Supabase Auth replaces legacy mutations:
  - LOGIN_MUTATION
  - REFRESH_TOKEN_MUTATION
  - LOGOUT_MUTATION
  - LOGOUT_ALL_MUTATION
  - FORGOT_PASSWORD_MUTATION
  - RESET_PASSWORD_MUTATION
*/

// Profile creation (called after Supabase SignUp)
export const REGISTER_MUTATION = gql`
  mutation Register(
    $firstName: String!
    $lastName: String
    $username: String
    $email: String!
  ) {
    createUser(
      firstName: $firstName
      lastName: $lastName
      username: $username
      email: $email
    ) {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
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
