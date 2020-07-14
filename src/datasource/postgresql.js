import { DataSource } from 'apollo-datasource';

import postgresql from '../database/postgresql';


const sql =
  `
  select
    pgtb.table_catalog                                                                             as database,
    pgtb.table_schema                                                                              as schema,
    tb.relname                                                                                     as table_en,
    cast(obj_description(relfilenode, 'pg_class') as varchar)                                      as table_zh,
    col.attname                                                                                    as property,
    cold.description                                                                               as note,
    concat_ws('', tp.typname, SUBSTRING(format_type(col.atttypid, col.atttypmod) from '\\(.*\\)')) as type
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

function get_or_create(node, key)
{
  if (!node[key])
  {
    node[key] = {};
  }

  return node[key];
}


function process(rows)
{
  const rt = {};

  const callback = (v) =>
  {
    const db = get_or_create(rt, v.database);
    const sm = get_or_create(db, v.schema  );
    const tb = get_or_create(sm, v.table_en);
    const pr = get_or_create(tb, v.property);

    tb.____name_zh = v.table_zh;

    pr.type = v.type;
    pr.note = v.note;
  };

  rows.forEach(d => callback(d));

  const databases = [];

  for (const [k_db, v_db] of Object.entries(rt))
  {
    const schemas = [];

    for (const [k_sm, v_sm] of Object.entries(v_db))
    {
      const tables = [];

      for (const [k_tb, v_tb] of Object.entries(v_sm))
      {
        const columns = [];

        const note = v_tb.____name_zh;

        delete v_tb.____name_zh;

        for (const [k_pr, v_pr] of Object.entries(v_tb))
        {
          columns.push({ name: k_pr, type: v_pr.type, note: v_pr.note });
        }

        tables.push({ name: k_tb, properties: columns, note });
      }

      schemas.push({ name: k_sm, entities: tables });
    }

    databases.push({ name: k_db, projects: schemas });
  }

  return databases;
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

  async structure(name)
  {
    const rows = await postgresql.query(name ? name : 'postgres', sql);

    const domain = process(rows)[0];

    return { name: '', note: '', projects: domain.projects };
  }
}


export default Source;
