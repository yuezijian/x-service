import { gql, makeExecutableSchema, mergeSchemas } from 'apollo-server-koa';

import type from '../schema/orm';


const definitions = gql
  `
    extend type Query
    {
      pg_domains: [Domain]
    }
  `;

const resolvers =
  {
    Query:
      {
        pg_domains: async (_1, _2, { dataSources: { postgresql } }) =>
        {
          return await postgresql.structure();
        }
      }
  };


const schema = makeExecutableSchema({ typeDefs: type });


export default mergeSchemas({ schemas: [schema, definitions], resolvers });
