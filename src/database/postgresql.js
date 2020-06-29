import { Client } from 'pg';


const config =
  {
    host:     '10.68.4.74',
    port:     '5432',
    database: 'postgres',
    user:     'admin',
    password: 'msunsoft007'
  };

async function execute(sql)
{
  const client = new Client(config);

  await client.connect();

  const result = await client.query(sql);

  client.end();

  return result.rows;
}

const database =
  {
    async query(sql)
    {
      return execute(sql);
    }
  }


export default database;
