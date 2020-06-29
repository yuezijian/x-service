import { gql } from 'apollo-server-koa';


const definitions = gql
  `
    type Property
    {
      index: Int

      name: String
      type: String
      note: String
    }

    type Object
    {
      index: Int

      name: String
      note: String

      properties: [Property]
    }

    type Project
    {
      index: Int

      name: String

      objects: [Object]
    }

    type Domain
    {
      index: Int

      name: String

      projects: [Project]
    }

    type Date
    {
      year:  Int
      month: Int
      day:   Int
    }

    type Time
    {
      hour:   Int
      minute: Int
      second: Int
    }

    type Item
    {
      id:   ID
      name: String
      date: Date
      time: Time
    }

    type MutationResponseItem
    {
      success: Boolean!
      message: String
      item:    Item
    }

    type Query
    {
      hi: String

      item(id: ID!): Item

      items: [Item]

      domains: [Domain]
    }

    type Mutation
    {
      login(username: String!): String

      item_add(name: String!): MutationResponseItem!

      item_remove(id: ID!): MutationResponseItem!

      item_update(id: ID!, name: String!): MutationResponseItem!
    }

    type Subscription
    {
      on_item_add:    Item
      on_item_remove: Item
      on_item_update: Item
    }
  `;


export default definitions;