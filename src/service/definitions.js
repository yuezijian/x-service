import { gql } from 'apollo-server-koa';


const definitions = gql
  `
    type Property
    {
      name:          String
      type:          String
      not_null:      Boolean
      default_value: String
      note:          String
    }

    type Object
    {
      name: String
      note: String

      properties: [Property]
    }

    type Project
    {
      id:   ID

      name: String

      objects: [Object]
    }

    type Domain
    {
      id:   ID

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

    type MutationResponseObject
    {
      success: Boolean!
      message: String
      object:  Object
    }

    type Query
    {
      hi: String

      item(id: ID!): Item

      items: [Item]

      domains: [Domain]

      orm: [Object]
    }

    type Mutation
    {
      login(username: String!): String

      item_add(name: String!): MutationResponseItem!

      item_remove(id: ID!): MutationResponseItem!

      item_update(id: ID!, name: String!): MutationResponseItem!

      object_add(name: String!): MutationResponseObject!
    }

    type Subscription
    {
      on_item_add:    Item
      on_item_remove: Item
      on_item_update: Item
    }
  `;


export default definitions;
