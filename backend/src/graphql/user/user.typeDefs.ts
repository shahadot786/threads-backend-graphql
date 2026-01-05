export const userTypeDefs = /* GraphQL */ `
  type User {
    id: ID!
    firstName: String!
    lastName: String
    profileImageUrl: String
    email: String!
  }

  type AuthResponse {
    accessToken: String!
    user: User!
  }

  type Query {
    # Protected queries (requires authentication)
    getUsers: [User!]!
    getUserById(id: String!): User
    getUserByEmail(email: String): User
    getCurrentLoggedInUser: User
  }

  type Mutation {
    # Public mutations
    createUser(
      firstName: String!
      lastName: String
      profileImageUrl: String
      email: String!
      password: String!
    ): User!

    # Auth mutations
    login(email: String!, password: String!): AuthResponse!
    refreshToken: AuthResponse!
    logout: Boolean!
    logoutAll: Boolean!
  }
`;
