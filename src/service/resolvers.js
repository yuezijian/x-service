import { PubSub } from 'graphql-subscriptions';


const ps = new PubSub();

let gid = 6;

const db =
  {
    items:
      [
        { id: '1', name: '这是' },
        { id: '2', name: '一个'   },
        { id: '3', name: '订阅'   },
        { id: '4', name: '机制'   },
        { id: '5', name: '展示'   },
      ]
    // items:
    //   [
    //     { id: '1', name: 'love' },
    //     { id: '2', name: 'my'   },
    //     { id: '3', name: 'yf'   },
    //     { id: '4', name: 'fk'   },
    //     { id: '5', name: 'me'   },
    //   ]
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

        items: () => db.items
      },

    Mutation:
      {
        login: (_, { username }) =>
        {
          console.log(username);

          return '';
        },

        add_item: (_, { name }) =>
        {
          const item = { id: gid.toString(), name };

          db.items.push(item);

          gid += 1;

          const payload = { item };

          ps.publish('item_add', payload);

          return { success: true, message: 'done', item };
        }
      },

    Subscription:
      {
        item_add:
          {
            resolve: (payload) =>
            {
              return payload.item;
            },

            subscribe: () => ps.asyncIterator('item_add')
          }
      }
  };


export default resolvers;
