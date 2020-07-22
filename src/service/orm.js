import { gql, makeExecutableSchema, mergeSchemas } from 'apollo-server-koa';

import type from '../schema/orm';


const definitions = gql
  `
    extend type Query
    {
      project(name: String): Project
    }
  `;


const resolvers =
  {
    Query:
      {
        project: (_1, { name }, { dataSources: { orm } }) =>
        {
          return { name };

          // return { name: 'test', entities: [{ name: 'tt'}] };

          // return { name, entities: orm.entities() };
        }
      },

    Domain:
      {
        projects: (parent) =>
        {
          console.log('domain.projects');
        }
      },

    Project:
      {
        entities: (parent) =>
        {
          console.log('project.entities');
          console.log(parent);
        }
      },

    Entity:
      {
        properties: (parent, args, context, info) =>
        {
          console.log(parent);

          return [];
        }
      }

    // Mutation:
    //   {
    //     entity_add: async (_, { name }) =>
    //     {
    //       const entity = await orm.entity_add(name);
    //
    //       return { success: true, message: 'done', entity };
    //     }
    //   }
  };


const schema = makeExecutableSchema({ typeDefs: type });


export default mergeSchemas({ schemas: [schema, definitions], resolvers });
