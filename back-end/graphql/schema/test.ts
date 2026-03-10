export const TestTypeDefs = `
type Query {
  health: String!
  echo(message: String!): String!
}

type Mutation {
  dummyUpdate(input: String!): String!
}

`;
