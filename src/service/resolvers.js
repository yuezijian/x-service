import { PubSub } from 'graphql-subscriptions';

import pgst from './temp/pgst';

import orm from '../orm';


const ps = new PubSub();

let gid = 1;

const db =
  {
    items:
      [
      ]
  };

const resolvers =
  {
    Query:
      {
        hi: (parent, args, context, info) =>
        {
          console.log(parent);
          console.log(args);
          console.log(context);
          console.log(info);

          return 'hello ~';
        },

        item: (_, { id }) =>
        {
          return db.items.find(item => item.id === id);
        },

        items: () => db.items,

        domains: () => pgst(),

        orm: () => orm.entities()
      },

    Mutation:
      {
        login: (_, { username }) =>
        {
          console.log(username);

          return '';
        },

        item_add: (_, { name }) =>
        {
          const item = { id: gid.toString(), name };

          db.items.push(item);

          gid += 1;

          const payload = { item };

          ps.publish('on_item_add', payload);

          return { success: true, message: 'done', item };
        },

        item_remove: (_, { id }) =>
        {
          const index = db.items.findIndex((item) => item.id === id);

          const item = db.items[index];

          db.items.splice(index, 1);

          const payload = { item };

          ps.publish('on_item_remove', payload);

          return { success: true, message: 'done', item };
        },

        item_update: (_, { id, name }) =>
        {
          const item = db.items.find((item) => item.id === id);

          item.name = name;

          const payload = { item };

          ps.publish('on_item_update', payload);

          return { success: true, message: 'done', item };
        },

        entity_add: async (_, { name }) =>
        {
          const entity = await orm.entity_add(name);

          return { success: true, message: 'done', entity };
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


export default resolvers;
