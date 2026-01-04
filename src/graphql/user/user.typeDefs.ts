export const userTypeDefs = /* GraphQL */ `
  type User {
    id: String!
    firstName: String!
    lastName: String
    profileImageUrl: String
    email: String!
  }

  type Query {
    getUsers: [User!]!
    getUserById(id: String!): User
  }

  type Mutation {
    createUser(
      firstName: String!
      lastName: String
      profileImageUrl: String
      email: String!
      password: String!
    ): User!
  }
`;
