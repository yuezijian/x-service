import { PubSub } from 'graphql-subscriptions';


const ps = new PubSub();


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

        item: (_1, { id }, { dataSources: { array } }) =>
        {
          return array(id);
        },

        items: (_1, _2, { dataSources: { array } }) =>
        {
          return array.all();
        },

        domains: (_1, { database }, { dataSources: { postgres } }) =>
        {
          return postgres.structure(database);
        },

        orm: (_1, _2, { dataSources: { orm } }) =>
        {
          return orm.entities();
        }
      },

    Mutation:
      {
        login: (_, { username }) =>
        {
          console.log(username);

          return '';
        },

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
