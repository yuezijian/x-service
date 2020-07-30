import { Sequelize, DataTypes } from 'sequelize';


async function connect()
{
  const connection = 'postgres://admin:admin@localhost:5432/postgres';

  const define = { freezeTableName: true };
  const logging = false;  // (...message) => console.log(message)

  const sequelize = new Sequelize(connection, { define, logging });

  await sequelize.authenticate();

  return sequelize;
}

const orm_metadata =
  {
    model:
      {
        attributes:
          {
            name:
              {
                type: DataTypes.STRING,

                allowNull: false
              },

            soft_deletion:
              {
                type: DataTypes.BOOLEAN,

                allowNull: false,

                defaultValue: false
              },

            stamps:
              {
                type: DataTypes.BOOLEAN,

                allowNull: false,

                defaultValue: false
              },

            note:
              {
                type: DataTypes.STRING,

                allowNull: true
              }
          },

        options:
          {
            timestamps: false
          }
      },

    attribute:
      {
        attributes:
          {
            name:
              {
                type: DataTypes.STRING,

                allowNull: false
              },

            type:
              {
                type: DataTypes.STRING,

                allowNull: false
              },

            not_null:
              {
                type: DataTypes.BOOLEAN,

                allowNull: false,

                defaultValue: false
              },

            default_value:
              {
                type: DataTypes.STRING,
              },

            note:
              {
                type: DataTypes.STRING,

                allowNull: true
              }
          },

        options:
          {
            timestamps: false
          }
      },

    association:
      {
        attributes:
          {
            name:
              {
                type: DataTypes.STRING,

                allowNull: false
              },

            type:
              {
                type: DataTypes.STRING,

                allowNull: false
              }
          },

        options:
          {
            timestamps: false
          }
      }
  };

function init_metadata(sequelize)
{
  const { model, attribute, association } = orm_metadata;

  const Model       = sequelize.define('_METADATA_MODEL',             model.attributes,       model.options);
  const Attribute   = sequelize.define('_METADATA_ATTRIBUTE',     attribute.attributes,   attribute.options);
  const Association = sequelize.define('_METADATA_ASSOCIATION', association.attributes, association.options);

  Model.hasMany(Attribute, { as: { singular: 'Attribute', plural: 'Attributes' }, foreignKey: 'ModelId' });

  Attribute.belongsTo(Model, { as: 'Model' });

  Association.belongsTo(Model, { as: 'Source' });
  Association.belongsTo(Model, { as: 'Target' });

  return { Model, Attribute, Association };
}

async function create_dev_data_metadata(Model, Attribute, Association)
{
  const patient = await Model.create({ name: 'Patient' });
  const order   = await Model.create({ name: 'Order'   });
  const drug    = await Model.create({ name: 'Drug'    });

  await Attribute.create({ name: 'name', type: 'string', ModelId: patient.id });

  await Attribute.create({ name: 'name', type: 'string', ModelId:   order.id });
  await Attribute.create({ name: 'unit', type: 'string', ModelId:   order.id });

  await Attribute.create({ name: 'name', type: 'string', ModelId:    drug.id });
  await Attribute.create({ name: 'note', type: 'string', ModelId:    drug.id });

  await Association.create({ name: 'orders', type: 'many', SourceId: patient.id, TargetId: order.id });
  await Association.create({ name: 'drug',   type: 'one',  SourceId:   order.id, TargetId:  drug.id });
}

async function create_dev_data_entity(sequelize)
{
  const Patient = sequelize.models['Patient'];
  const Order   = sequelize.models['Order'  ];
  const Drug    = sequelize.models['Drug'   ];

  const patient = await Patient.create({ name: '医生1'                        });
  const order   = await   Order.create({ name: '医嘱1', PatientId: patient.id });
  const drug    = await    Drug.create({ name: '药品1',   OrderId:   order.id });
}

const gql_type =
  {
    string: 'String'
  };

const sequelize_type =
  {
    string: DataTypes.STRING
  };

function gql_type_scalar(attribute)
{
  // console.log(attribute.toJSON());

  return `  ${ attribute.name }: ${ gql_type[attribute.type] }`;
}

function gql_type_object(association)
{
  const name = association.name;
  const type = association.type === 'many' ? `[${ association.Target.name }]` : association.Target.name;

  return `  ${ name }: ${ type }`;
}

function make_sequelize_attribute(attribute)
{
  const object =
    {
      type:      sequelize_type[attribute.type],

      allowNull: !attribute.not_null
    };

  if (attribute.default_value)
  {
    object.defaultValue = attribute.default_value;
  }

  return object;
}

function generate_schema(model, attributes, associations)
{
  let properties = attributes.map(gql_type_scalar);

  if (associations.length > 0)
  {
    properties += '\n';
    properties += associations.map(gql_type_object);
  }

  const schema = `type ${ model.name }\n{\n${ properties }\n}\n`;

  console.log(schema);

  return schema;
}

function generate_model(sequelize, metadata)
{
  const name = metadata.model.name;

  const attributes = {};

  for (const attribute of metadata.attributes)
  {
    attributes[attribute.name] = make_sequelize_attribute(attribute);
  }

  const options =
    {
      timestamps: metadata.model.stamps,

      paranoid:   metadata.model.soft_deletion
    };

  sequelize.define(name, attributes, options);
}

function generate_association(sequelize, association)
{
  const source = sequelize.models[association.Source.name];
  const target = sequelize.models[association.Target.name];

  switch (association.type)
  {
    case 'one':
    {
      source.hasOne(target);

      break;
    }
    case 'many':
    {
      source.hasMany(target);

      break;
    }
    default:
    {
      console.error(`association type [${ association.type }] not supported yet`);
    }
  }
}

async function main()
{
  const sequelize = await connect();

  const { Model, Attribute, Association } = init_metadata(sequelize);

  await sequelize.sync({ force: true });

  await create_dev_data_metadata(Model, Attribute, Association);

  // 生成 Scheme 和 Sequelize Model

  // const models = await Model.findAll();
  //
  // for (const model of models)
  // {
  //   const attributes   = await   Attribute.findAll({ where: {  ModelId: model.id }                    });
  //   const associations = await Association.findAll({ where: { SourceId: model.id }, include: 'Target' });
  //
  //   generate_schema(model, attributes, associations);
  //
  //   generate_model(sequelize, { model, attributes });
  // }
  //
  // const associations = await Association.findAll({ include: ['Source', 'Target'] });
  //
  // for (const association of associations)
  // {
  //   generate_association(sequelize, association);
  // }
  //
  // await sequelize.sync({ force: true });
  //
  // await create_dev_data_entity(sequelize);

  // 使用接口查询一些数据

  // 使用接口加入一些数据

  await sequelize.close();
}


main().catch(error => console.log(error));
