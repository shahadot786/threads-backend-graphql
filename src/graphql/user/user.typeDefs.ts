export const userTypeDefs = /* GraphQL */ `
  type User {
    id: ID!
    firstName: String!
    lastName: String
    profileImageUrl: String
    email: String!
  }

  type Query {
    # Public queries
    getUsers: [User!]!
    getUserById(id: String!): User
    getUserByEmail(email: String): User
    
    # Protected queries (requires authentication)
    getCurrentLoggedInUser: User
  }

  type Mutation {
    createUser(
      firstName: String!
      lastName: String
      profileImageUrl: String
      email: String!
      password: String!
    ): User!

    getUserToken(email: String!, password: String!): String!
  }
`;
