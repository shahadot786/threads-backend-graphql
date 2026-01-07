export const reportTypeDefs = /* GraphQL */ `
  type Report {
    id: ID!
    category: String!
    description: String!
    attachmentUrl: String
    deviceInfo: String # JSON string
    status: String!
    userId: ID
    user: User
    createdAt: String!
  }

  input CreateReportInput {
    category: String!
    description: String!
    attachmentUrl: String
    deviceInfo: String # JSON string
  }

  extend type Mutation {
    submitReport(input: CreateReportInput!): Boolean!
  }
`;
