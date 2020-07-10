import { Client } from 'pg';


async function execute(config, sql)
{
  const client = new Client(config);

  await client.connect();

  const result = await client.query(sql);

  client.end();

  return result.rows;
}

const postgres =
  {
    async query(database, sql)
    {
      const config =
        {
          host:     '10.68.4.74',
          port:     '5432',

          database: database,

          user:     'admin',
          password: 'msunsoft007'
        };

      return execute(config, sql);
    }
  }


export default postgres;
