import { gql } from 'apollo-server-koa';


const definitions = gql
  `
    type Item
    {
      id:   ID
      name: String
    }

    type Query
    {
      hi: String

      item(id: ID!): Item

      items: [Item]
    }

    type ItemUpdateResponse
    {
      success: Boolean!
      message: String
      item:    Item
    }

    type Mutation
    {
      login(username: String!): String

      add_item(name: String!): ItemUpdateResponse!
    }

    type Subscription
    {
      item_add: Item
    }
  `;


export default definitions;
