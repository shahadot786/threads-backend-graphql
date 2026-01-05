import { gql } from "@apollo/client/core";

// Auth Mutations
export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      user {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken {
    refreshToken {
      accessToken
      user {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register(
    $firstName: String!
    $lastName: String
    $email: String!
    $password: String!
  ) {
    createUser(
      firstName: $firstName
      lastName: $lastName
      email: $email
      password: $password
    ) {
      id
      firstName
      lastName
      email
    }
  }
`;

// User Queries
export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    getCurrentLoggedInUser {
      id
      firstName
      lastName
      email
      profileImageUrl
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    getUsers {
      id
      firstName
      lastName
      email
      profileImageUrl
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query GetUserById($id: String!) {
    getUserById(id: $id) {
      id
      firstName
      lastName
      email
      profileImageUrl
    }
  }
`;
