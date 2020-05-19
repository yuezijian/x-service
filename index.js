import fs   from 'fs';
import http from 'http';

import jwt from 'jsonwebtoken';

import Koa           from 'koa';
import KoaBodyParser from 'koa-bodyparser';
import KoaJWT        from 'koa-jwt';

import KoaCORS   from '@koa/cors';
import KoaRouter from '@koa/router';

import service_gql from './service/graphql';


const secret = fs.readFileSync('./secret.pub');

const payload = {};

const token = jwt.sign(payload, secret);

console.log(token);


function Authentication(ctx, next)
{
  if (ctx.url.match(/^\/authentication/))
  {
    ctx.body = 'Authentication\n';
  }
  else
  {
    return next();
  }
}


const app = new Koa();

const router = new KoaRouter();

router.all(service_gql.path, service_gql.middleware);

app.use(KoaBodyParser());
app.use(KoaCORS());
app.use(KoaJWT({ secret }).unless({ path: [/^\/authentication/] }));

app.use(Authentication);

app.use(router.routes());
app.use(router.allowedMethods());


const option =
  {
    key: fs.readFileSync('./server.key', 'utf8'),
    cert: fs.readFileSync('./server.cert', 'utf8')
  };

const server = http.createServer(option, app.callback());

const port = 4000;

const callback = () =>
{
  console.log(`🚀 Server ready at http://localhost:${ port }${ service_gql.path }`);
};

server.listen(port, callback);
