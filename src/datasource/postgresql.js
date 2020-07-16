import { DataSource } from 'apollo-datasource';

import postgresql from '../database/postgresql';


function stratify(array, levels)
{
  const root = {};

  for (const object of array)
  {
    let node = root;

    for (const { name, parent, properties } of levels)
    {
      const value = object[name];

      let children = node[parent];

      if (!children)
      {
        children = node[parent] = [];
      }

      let child = children.find(v => v.name === value);

      if (!child)
      {
        child = { name: value };

        properties.forEach(property => child[property.as ? property.as : property.name] = object[property.name]);

        children.push(child);
      }

      node = child;
    }
  }

  return root;
}

async function pg_databases()
{
  const sql = 'select datname as name from pg_database where datistemplate=\'f\';';

  const rows = await postgresql.query('postgres', sql);

  return rows.map(value => value.name);
}

async function pg_database(name)
{
  const sql =
    `
      select
        pgtb.table_catalog                                                                             as database,
        pgtb.table_schema                                                                              as schema,
        tb.relname                                                                                     as table,
        col.attname                                                                                    as column,
        concat_ws('', tp.typname, SUBSTRING(format_type(col.atttypid, col.atttypmod) from '\\(.*\\)')) as type,
        cast(obj_description(relfilenode, 'pg_class') as varchar)                                      as note_table,
        cold.description                                                                               as note_column
      from pg_attribute col
        left join pg_class tb on tb.oid = col.attrelid
        left join pg_description cold on cold.objoid = col.attrelid and cold.objsubid = col.attnum
        left join pg_type tp on col.atttypid = tp.oid
        left join information_schema.tables pgtb on tb.relname = pgtb.table_name
      where col.attnum > 0
        and cold.objsubid = col.attnum
        and cold.objoid = col.attrelid
      order by tb.relname, col.attnum
    `
  ;

  const rows = await postgresql.query(name, sql);

  const levels =
    [
      { name: 'database', parent: 'domains',    properties: [                                                      ] },
      { name: 'schema',   parent: 'projects',   properties: [                                                      ] },
      { name: 'table',    parent: 'entities',   properties: [                   { name: 'note_table',  as: 'note' }] },
      { name: 'column',   parent: 'properties', properties: [ { name: 'type' }, { name: 'note_column', as: 'note' }] }
    ];

  return stratify(rows, levels).domains;
}


class Source extends DataSource
{
  constructor()
  {
    super();
  }

  initialize(config)
  {
  }

  async structure()
  {
    const dbs = await pg_databases();

    const domains = [];

    for (const name of dbs)
    {
      const data = await pg_database(name);

      if (data)
      {
        domains.push(data[0]);
      }
    }

    return domains;
  }
}


export default Source;
