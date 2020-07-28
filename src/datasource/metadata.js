import { DataSource } from 'apollo-datasource';

import { Sequelize, Model, DataTypes } from 'sequelize';

import ORM from '../orm';


const orm = new ORM();


async function read_entities(Model, Attribute, Association)
{
  const models       = await       Model.findAll();
  const attributes   = await   Attribute.findAll();
  const associations = await Association.findAll();

  const to_property = (a) =>
  {
    const property =
      {
        name:          a.name,
        type:          a.type,
        not_null:      a.not_null,
        default_value: a.default_value,
        note:          a.note,
      };

    return property;
  };

  const to_entity = (t) =>
  {
    const entity =
      {
        name: t.name,
        note: t.note,

        properties: attributes.filter(a => t.id === a.ModelId).map(to_property),
      };

    return entity;
  };

  return models.map(to_entity);
}


async function connect()
{
  const connection = 'postgres://admin:admin@localhost:5432/postgres';

  const define = { freezeTableName: true };
  const logging = false;  // (...message) => console.log(message)

  const sequelize = new Sequelize(connection, { define, logging });

  await sequelize.authenticate();

  return sequelize;
}



class Source extends DataSource
{
  constructor()
  {
    super();
  }

  async initialize(config)
  {
    await orm.init();
  }

  async project(name)
  {
    return await orm.project(name);
  }

  // async entities()
  // {
  //   const sequelize = await connect();
  //
  //   const { Model, Attribute, Association } = await orm_init_metadata(sequelize);
  //
  //   const entities = await read_entities(Model, Attribute, Association);
  //
  //   await sequelize.close();
  //
  //   return entities;
  // }

  // async one_entity(name)
  // {
  //   const entity = await demo.one_entity(name);
  //
  //   console.log(entity.toJSON());
  //
  //   return entity;
  // }

  // async entity_add(name)
  // {
  //   const sequelize = await connect();
  //
  //   const { Model, Attribute, Association } = await orm_init_metadata(sequelize);
  //
  //   const model = await Model.create({ name });
  //
  //   await sequelize.close();
  //
  //   return { name, note: '', properties: [] };
  // }
}


export default Source;

// const associations = await Association.findAll({ include: [{ model: Table, as: 'Source' }, { model: Table, as: 'Target' }] });

// associations.forEach(value => console.log(value.toJSON()));



