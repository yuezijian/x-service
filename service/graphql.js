import { gql, makeExecutableSchema, ApolloServer } from 'apollo-server-koa';


let gid = 6;

const db =
  {
    items:
      [
        { id: '1', name: 'love' },
        { id: '2', name: 'my'   },
        { id: '3', name: 'yf'   },
        { id: '4', name: 'fk'   },
        { id: '5', name: 'me'   },
      ]
  };

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
  `;

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

          console.log(db.items);

          return { success: true, message: 'done', item };
        }
      }
  };

function context_koa({ ctx })
{
  // console.log(ctx.request.header.authorization);

  return { user: { id: 0 } };
}

const config =
  {
    schema: makeExecutableSchema({ typeDefs: definitions, resolvers: resolvers }),

    context: context_koa
  };

const apollo = new ApolloServer(config);

const service =
  {
    path:       apollo.graphqlPath,
    middleware: apollo.getMiddleware()
  };


export default service;
