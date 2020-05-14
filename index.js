import Koa from 'koa';

import { createServer } from 'http'

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
          console.log(parent);
          console.log(args);
          console.log(context);
          console.log(info);

          return 'hello~';
        }
      }
  };



const config =
  {
    schema: makeExecutableSchema({ typeDefs: definitions, resolvers: resolvers })
  };

const apollo = new ApolloServer(config);

const app = new Koa();

const server = createServer(app.callback());

const host = 'localhost';
const port = 4000;

const callback = () =>
{
  console.log(`🚀 Server ready at http://${ host }:${ port }${ apollo.graphqlPath }`);
};

app.use(apollo.getMiddleware());

server.listen(port, callback);
