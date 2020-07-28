import fs   from 'fs';
import http from 'http';

import jwt from 'jsonwebtoken';

import Koa           from 'koa';
import KoaBodyParser from 'koa-bodyparser';
// import KoaJWT        from 'koa-jwt';

import KoaCORS   from '@koa/cors';
import KoaRouter from '@koa/router';

import { execute, subscribe } from 'graphql';

import { ApolloServer } from 'apollo-server-koa';

import { SubscriptionServer } from 'subscriptions-transport-ws';

import { mergeSchemas } from 'graphql-tools';

import docker     from './service/docker';
import example    from './service/example';
import metadata   from './service/metadata';
import postgresql from './service/postgresql';

import SourceDocker   from './datasource/docker';
import SourceExample  from './datasource/example';
import SourceMetadata from './datasource/metadata';
import SourcePG       from './datasource/postgresql';


const secret = fs.readFileSync('./secret.pub');

const payload = {};

const token = jwt.sign(payload, secret);

// console.log(token);


function Status_401(ctx, next)
{
  const on_reject = (error) =>
  {
    if (401 === error.status)
    {
      ctx.status = 401;
      ctx.body = 'Protected resource, use Authorization header to get access\n';

      // ctx.redirect(`${ ctx.request.header.origin }/login`)
    }
    else
    {
      throw error;
    }
  };

  return next().catch(on_reject);
}

function Authentication(ctx, next)
{
  if (ctx.url.match(/^\/authentication/))
  {
    const user = ctx.request.body.user;

    console.log(user);

    // if (user.name === 'yzj' && user.password === 'yzj')
    // {
    //   ctx.body = token;
    // }

    ctx.body = token;
  }
  else
  {
    return next();
  }
}


function context_koa({ ctx })
{
  // console.log(ctx.request.header.authorization);

  return { user: { id: 0 } };
}

const schemas =
  [
    docker, example, postgresql, metadata
  ];

const schema = mergeSchemas({ schemas });


const config =
  {
    schema,

    context: context_koa,

    dataSources: () =>
    {
      const docker = new SourceDocker();

      const example = new SourceExample();

      const metadata = new SourceMetadata();

      const postgresql = new SourcePG();

      return { docker, example, metadata, postgresql };
    }
  };

const apollo = new ApolloServer(config);

const koa = new Koa();

const router = new KoaRouter();

router.all(apollo.graphqlPath, apollo.getMiddleware());

koa.use(KoaBodyParser());
koa.use(KoaCORS());

// koa.use(Status_401);

// koa.use(KoaJWT({ secret }).unless({ path: [/^\/authentication/] }));
// koa.use(Authentication);
koa.use(router.routes());
koa.use(router.allowedMethods());


const option =
  {
    // key: fs.readFileSync('./server.key', 'utf8'),
    // cert: fs.readFileSync('./server.cert', 'utf8')
  };

const server = http.createServer(option, koa.callback());

const host = 'localhost';
const port = 4000;

const callback = () =>
{
  new SubscriptionServer({ execute, subscribe, schema }, { server: koa });

  console.log(`🚀 Server ready at http://${ host }:${ port }${ apollo.graphqlPath }`);
  console.log(`🚀 Subscriptions ready at ws://${ host }:${ port }${ apollo.subscriptionsPath }`);
};

apollo.installSubscriptionHandlers(server);

server.listen(port, callback);
