import { gql, makeExecutableSchema, mergeSchemas } from 'apollo-server-koa';

import type from '../schema/orm';


const definitions = gql
  `
    extend type Query
    {
      pg_domains: [Domain]
    }
  `;

let temp = null;

const resolvers =
  {
    Query:
      {
        pg_domains: async (_1, _2, { dataSources: { postgresql } }) =>
        {
          if (!temp)
          {
            temp = await postgresql.structure();
          }

          return temp;
        }
      }
  };


const schema = makeExecutableSchema({ typeDefs: type });


export default mergeSchemas({ schemas: [schema, definitions], resolvers });
