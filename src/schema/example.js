const definitions =
  `
    type Item
    {
      id:   ID
      name: String
    }

    type MutationResponseItem
    {
      success: Boolean!
      message: String
      item:    Item
    }

    type Query
    {
      item(id: ID!): Item

      items: [Item]
    }

    type Mutation
    {
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
