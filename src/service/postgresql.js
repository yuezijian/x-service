import { gql, makeExecutableSchema, mergeSchemas } from 'apollo-server-koa';

import type from '../schema/orm';


const definitions = gql
  `
    extend type Query
    {
      pg(name: String): Domain
    }
  `;


const resolvers =
  {
    Query:
      {
        pg: (_1, { name }, { dataSources: { postgresql } }) =>
        {
          return postgresql.structure(name);
        }
      }
  };


const schema = makeExecutableSchema({ typeDefs: type });


export default mergeSchemas({ schemas: [schema, definitions], resolvers });
