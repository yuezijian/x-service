import {DataTypes, Sequelize} from 'sequelize';


const metadata =
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


class ORM
{
  constructor()
  {
    this.sequelize = null;

    this.metaobject = {};

    this.schema = null;
  }

  async connect()
  {
    const connection = 'postgres://admin:admin@localhost:5432/postgres';

    const define = { freezeTableName: true };
    const logging = false;  // (...message) => console.log(message)

    this.sequelize = new Sequelize(connection, { define, logging });

    await this.sequelize.authenticate();
  }

  async build_metadata()
  {
    const { model, attribute, association } = metadata;

    const Model       = this.sequelize.define('_METADATA_MODEL',             model.attributes,       model.options);
    const Attribute   = this.sequelize.define('_METADATA_ATTRIBUTE',     attribute.attributes,   attribute.options);
    const Association = this.sequelize.define('_METADATA_ASSOCIATION', association.attributes, association.options);

    Model.hasMany(Attribute, { as: { singular: 'Attribute', plural: 'Attributes' }, foreignKey: 'ModelId' });

    Attribute.belongsTo(Model, { as: 'Model' });

    Association.belongsTo(Model, { as: 'Source' });
    Association.belongsTo(Model, { as: 'Target' });

    await this.sequelize.sync();

    this.metaobject = { Model, Attribute, Association };
  }

  async build_model()
  {
    this.schema = '';

    const { Model, Attribute, Association } = this.metaobject;

    const models = await Model.findAll();

    for (const model of models)
    {
      const attributes   = await   Attribute.findAll({ where: {  ModelId: model.id }                    });
      const associations = await Association.findAll({ where: { SourceId: model.id }, include: 'Target' });

      this.schema += build_schema({ model, attributes, associations });

      define_model(this.sequelize, { model, attributes });
    }

    const associations = await Association.findAll({ include: ['Source', 'Target'] });

    for (const association of associations)
    {
      generate_association(this.sequelize, { association });
    }

    await this.sequelize.sync();
  }

  async init()
  {
    if (!this.sequelize)
    {
      await this.connect();

      await this.build_metadata();

      await this.build_model();
    }
  }

  async project(name)
  {
    const Model = this.metaobject.Model;

    const models = await Model.findAll({ include: 'Attributes' });

    models.forEach(model => console.log(model.toJSON()));

    const to_property = attribute =>
    {
      const object =
        {
          name:          attribute.name,
          note:          attribute.note,
          type:          attribute.type,
          not_null:      attribute.not_null,
          default_value: attribute.default_value
        };

      return object;
    };

    const entities = models.map(model => ({ name: model.name, properties: model.Attributes.map(to_property) }));

    return { entities };
  }
}


function build_schema(metadata)
{
  let properties = metadata.attributes.map(gql_type_scalar);

  if (metadata.associations.length > 0)
  {
    properties += '\n';
    properties += metadata.associations.map(gql_type_object);
  }

  const schema = `type ${ metadata.model.name }\n{\n${ properties }\n}\n`;

  console.log(schema);

  return schema;
}

function define_model(sequelize, metadata)
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

function generate_association(sequelize, metadata)
{
  const source = sequelize.models[metadata.association.Source.name];
  const target = sequelize.models[metadata.association.Target.name];

  switch (metadata.association.type)
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
      console.error(`association type [${ metadata.association.type }] not supported yet`);
    }
  }
}


export default ORM;
