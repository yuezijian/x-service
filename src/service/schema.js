import { makeExecutableSchema } from 'apollo-server-koa';

import definitions from './definitions';
import resolvers   from './resolvers';


const schema = makeExecutableSchema({ typeDefs: definitions, resolvers: resolvers });


export default schema;
