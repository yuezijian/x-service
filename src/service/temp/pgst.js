import database from '../../database/postgresql';


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

  let i_db = 0;

  const databases = [];

  for (const [k_db, v_db] of Object.entries(rt))
  {
    let i_sm = 0;

    const schemas = [];

    for (const [k_sm, v_sm] of Object.entries(v_db))
    {
      let i_tb = 0;

      const tables = [];

      for (const [k_tb, v_tb] of Object.entries(v_sm))
      {
        let i_pr = 0;

        const properties = [];

        const note = v_tb.____name_zh;

        delete v_tb.____name_zh;

        for (const [k_pr, v_pr] of Object.entries(v_tb))
        {
          properties.push({ index: i_pr++, name: k_pr, type: v_pr.type, note: v_pr.note });
        }

        tables.push({ index: i_tb++, name: k_tb, properties, note });
      }

      schemas.push({ index: i_sm++, name: k_sm, entities: tables });
    }

    databases.push({ index: i_db++, name: k_db, projects: schemas });
  }

  return databases;
}


async function pgst()
{
  const rows = await database.query(sql);

  return process(rows);
}


export default pgst;
