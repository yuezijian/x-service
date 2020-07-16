import { gql, makeExecutableSchema, mergeSchemas } from 'apollo-server-koa';

import type from '../schema/docker';


const definitions = gql
  `
    extend type Query
    {
      containers: [Container]

      images: [Image]

      container(id: String!): Container

      image(id: String!): Image
    }
  `;


const resolvers =
  {
    Query:
      {
        containers: (_1, _2, { dataSources: { docker } }) =>
        {
          return docker.containers();
        },

        images: (_1, _2, { dataSources: { docker } }) =>
        {
          return [];
        },

        container: (_1, { id }, { dataSources: { docker } }) =>
        {
          return {};
        },

        image: (_1, { id }, { dataSources: { docker } }) =>
        {
          return {};
        }
      }
  };


const schema = makeExecutableSchema({ typeDefs: type });


export default mergeSchemas({ schemas: [schema, definitions], resolvers });
