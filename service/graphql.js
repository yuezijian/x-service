import { gql, makeExecutableSchema, ApolloServer } from 'apollo-server-koa';


const definitions = gql
    `
    type Query
    {
      hi: String
    }
  `;

const resolvers =
  {
    Query:
      {
        hi: (parent, args, context, info) =>
        {
          // console.log(parent);
          // console.log(args);
          // console.log(context);
          // console.log(info);

          return 'hello ~';
        }
      }
  };

function ctx_koa({ ctx })
{
  console.log(ctx.request.header.authorization);

  return { user: { id: 0 } };
}

const config =
  {
    schema: makeExecutableSchema({ typeDefs: definitions, resolvers: resolvers }),

    context: ctx_koa
  };

const apollo = new ApolloServer(config);

const service =
  {
    path: apollo.graphqlPath,
    middleware: apollo.getMiddleware()
  };


export default service;
