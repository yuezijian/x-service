import { makeExecutableSchema } from 'graphql-tools';

import { PubSub } from 'graphql-subscriptions';

import type from '../schema/example';


const ps = new PubSub();


const resolvers =
  {
    Query:
      {
        item: (_1, { id }, { dataSources: { array } }) =>
        {
          return array(id);
        },

        items: (_1, _2, { dataSources: { array } }) =>
        {
          return array.all();
        }
      },

    Mutation:
      {
        item_add: (_, { name }, { dataSources: { array } }) =>
        {
          const item = array.add(name);

          const payload = { item };

          ps.publish('on_item_add', payload);

          return { success: true, message: 'done', item };
        },

        item_remove: (_, { id }, { dataSources: { array } }) =>
        {
          const item = array.remove(id);

          const payload = { item };

          ps.publish('on_item_remove', payload);

          return { success: true, message: 'done', item };
        },

        item_update: (_, { id, name }, { dataSources: { array } }) =>
        {
          const item = array.update(id, name);

          const payload = { item };

          ps.publish('on_item_update', payload);

          return { success: true, message: 'done', item };
        }
      },

    Subscription:
      {
        on_item_add:
          {
            resolve: (payload) =>
            {
              return payload.item;
            },

            subscribe: () => ps.asyncIterator('on_item_add')
          },

        on_item_remove:
          {
            resolve: (payload) =>
            {
              return payload.item;
            },

            subscribe: () => ps.asyncIterator('on_item_remove')
          },

        on_item_update:
          {
            resolve: (payload) =>
            {
              return payload.item;
            },

            subscribe: () => ps.asyncIterator('on_item_update')
          }
      }
  };


export default makeExecutableSchema({ typeDefs: type, resolvers });
