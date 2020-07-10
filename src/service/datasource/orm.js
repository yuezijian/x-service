import { DataSource } from 'apollo-datasource';

import { Sequelize, Model, DataTypes } from 'sequelize';


const tables =
  [
    {
      name: 'Patient',

      attributes:
        {
          name:
            {
              type:      DataTypes.STRING,
              allowNull: false
            }
        },

      options: {}
    },

    {
      name: 'Drug',

      attributes:
        {
          name:
            {
              type:      DataTypes.STRING,
              allowNull: false
            }
        },

      options: {}
    },

    {
      name: 'Order',

      attributes:
        {
          name:
            {
              type:      DataTypes.STRING,
              allowNull: false
            }
        },

      options:
        {
          paranoid: true  // 软删除
        }
    }
  ];


async function create_dev_data(Model, Attribute, Association)
{
  {
    const model = await Model.create({ name: 'Department' });

    {
      const attribute = await Attribute.create({ name: 'name', type: 'string', not_null: true, note: 'department.name' });

      await model.addAttribute(attribute);
    }
    {
      const attribute = await Attribute.create({ name: 'note', type: 'string',  note: 'department.note' });

      await model.addAttribute(attribute);
    }
  }
  {
    const model = await Model.create({ name: 'Doctor' });

    {
      const attribute = await Attribute.create({ name: 'name', type: 'string', not_null: true, note: 'doctor.name' });

      await model.addAttribute(attribute);
    }
  }
  {
    const department = await Model.findOne({ where: { name: 'Department' } });
    const doctor     = await Model.findOne({ where: { name: 'Doctor'     } });

    const association = await Association.create({ relationship: 'has_many' });

    await association.setSource(department);
    await association.setTarget(doctor);
  }

  // const Department = sequelize.models['Department'];
  // const Doctor     = sequelize.models['Doctor'    ];
  // const Drug       = sequelize.models['Drug'      ];
  // const Patient    = sequelize.models['Patient'   ];
  // const Order      = sequelize.models['Order'     ];
  //
  // const [department_doctor] = await Department.findOrCreate({ where: { name: '科室1' } });
  // const [department_drug  ] = await Department.findOrCreate({ where: { name: '药房1' } });
  //
  // const [doctor ] = await  Doctor.findOrCreate({ where: { name: '医生1' } });
  // const [drug   ] = await    Drug.findOrCreate({ where: { name: '药品1' } });
  // const [patient] = await Patient.findOrCreate({ where: { name: '患者1' } });
  // const [order  ] = await   Order.findOrCreate({ where: { name: '医嘱1' } });
  //
  // await doctor.setDepartment(department_doctor);  // department_doctor.addDoctor(doctor);
  //
  // await drug.setDepartment(department_drug);  // department_drug.addDrug(drug);
  //
  // await order.setDoctor(doctor);
  // await order.setDrug(drug);
  // await order.setPatient(patient);
  //
  // const order = await Order.findOne();
  // const order = await Order.findOne({ include: ['Doctor', 'Drug', 'Patient'] });
  //
  // console.log(order.toJSON());
}

async function init_metadata(sequelize)
{
  const model =
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
    };

  const attribute =
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
    };

  const association =
    {
      attributes:
        {
          relationship:
            {
              type: DataTypes.STRING,

              allowNull: false
            }
        },

      options:
        {
          timestamps: false
        }
    };

  const Model       = sequelize.define('_METADATA_MODEL',             model.attributes,       model.options);
  const Attribute   = sequelize.define('_METADATA_ATTRIBUTE',     attribute.attributes,   attribute.options);
  const Association = sequelize.define('_METADATA_ASSOCIATION', association.attributes, association.options);

  Model.hasMany(Attribute, { as: 'Attribute', foreignKey: 'ModelId' });

  Attribute.belongsTo(Model, { as: 'Model' });

  Association.belongsTo(Model, { as: 'Source' });
  Association.belongsTo(Model, { as: 'Target' });

  return { Model, Attribute, Association };
}


const types =
  {
    string: DataTypes.STRING
  };


async function init_entities(sequelize, { models, attributes, associations })
{
  const build_attribute = (a, m) =>
  {
    m.attributes[a.name] =
      {
        type:      types[a.type],

        allowNull: !a.not_null
      };

    if (a.default_value)
    {
      m.attributes[a.name].defaultValue = a.default_value;
    }
  };

  const to_model = (t) =>
  {
    const model =
      {
        name: t.name,

        attributes: {},

        options:
          {
            timestamps: t.stamps,

            paranoid:   t.soft_deletion
          }
      };

    attributes
      .filter(a => t.id === a.TableId)
      .forEach(a => build_attribute(a, model))
    ;

    sequelize.define(model.name, model.attributes, model.options);
  };

  tables.map(to_model);

  await sequelize.sync();
}


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

  initialize(config)
  {
  }

  async reset()
  {
    const sequelize = await connect();

    const { Model, Attribute, Association } = await init_metadata(sequelize);

    await sequelize.sync({ force: true });

    await create_dev_data(Model, Attribute, Association);

    await sequelize.close();
  }

  async entities()
  {
    const sequelize = await connect();

    const { Model, Attribute, Association } = await init_metadata(sequelize);

    const entities = await read_entities(Model, Attribute, Association);

    await sequelize.close();

    return entities;
  }

  async entity_add(name)
  {
    const sequelize = await connect();

    const { Model, Attribute, Association } = await init_metadata(sequelize);

    const model = await Model.create({ name });

    await sequelize.close();

    return { name, note: '', properties: [] };
  }
}


export default Source;


// await init_models(sequelize, { tables, attributes, associations });

// const associations = await Association.findAll({ include: [{ model: Table, as: 'Source' }, { model: Table, as: 'Target' }] });

// associations.forEach(value => console.log(value.toJSON()));

// const Department = sequelize.models['Department'];
// const Doctor     = sequelize.models['Doctor'    ];
// const Drug       = sequelize.models['Drug'      ];
// const Patient    = sequelize.models['Patient'   ];
// const Order      = sequelize.models['Order'     ];
//
// Department.hasMany(Doctor);
// Doctor.belongsTo(Department);
//
// Department.hasMany(Drug);
// Drug.belongsTo(Department);
//
// Patient.hasMany(Order);
// Order.belongsTo(Patient);
//
// Doctor.hasOne(Order);
// Order.belongsTo(Doctor);
//
// Drug.hasOne(Order);
// Order.belongsTo(Drug);





