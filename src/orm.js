import { Sequelize, Model, DataTypes } from 'sequelize';


const tables =
  [
    {
      name: 'Doctor',

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


async function create_dev_data(sequelize, { Table, Attribute, Association })
{
  {
    const table = await Table.create({ name: 'Department' });

    {
      const attribute = await Attribute.create({ name: 'name', type: 'string', allow_null: false, note: 'department.name' });

      await table.addAttribute(attribute);
    }
    {
      const attribute = await Attribute.create({ name: 'note', type: 'string',  note: 'department.note' });

      await table.addAttribute(attribute);
    }
  }
  {
    const table = await Table.create({ name: 'Doctor' });

    {
      const attribute = await Attribute.create({ name: 'name', type: 'string', allow_null: false, note: 'doctor.name' });

      await table.addAttribute(attribute);
    }
  }
  {
    const department = await Table.findOne({ where: { name: 'Department' } });
    const doctor     = await Table.findOne({ where: { name: 'Doctor'     } });

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
  const table =
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

          default_value:
            {
              type: DataTypes.STRING,
            },

          allow_null:
            {
              type: DataTypes.BOOLEAN,

              allowNull: false,

              defaultValue: true
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

  const Table       = sequelize.define('_METADATA_TABLE',             table.attributes,       table.options);
  const Attribute   = sequelize.define('_METADATA_ATTRIBUTE',     attribute.attributes,   attribute.options);
  const Association = sequelize.define('_METADATA_ASSOCIATION', association.attributes, association.options);

  Table.hasMany(Attribute, { as: 'Attribute', foreignKey: 'TableId' });

  Attribute.belongsTo(Table, { as: 'Table' });

  Association.belongsTo(Table, { as: 'Source' });
  Association.belongsTo(Table, { as: 'Target' });

  const tables       = await       Table.findAll();
  const attributes   = await   Attribute.findAll();
  const associations = await Association.findAll();

  return { tables, attributes, associations };

  // for (const t of tables)
  // {
  //   sequelize.define(t.name, t.attributes, t.options);
  // }
  //
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
}


const types =
  {
    string: DataTypes.STRING
  };


async function init_models(sequelize, { tables, attributes, associations })
{
  const build_attribute = (a, m) =>
  {
    m.attributes[a.name] =
      {
        type:      types[a.type],

        allowNull: a.allow_null
      };

    if (a.default_value)
    {
      m.attributes[a.name].defaultValue = a.default_value;
    }
  };

  const build_model = (t) =>
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

  tables.map(build_model);

  await sequelize.sync();
}


function read_objects({ tables, attributes, associations })
{
  const to_property = (a) =>
  {
    const property =
      {
        name: a.name,
        type: a.type,
        note: a.note,
      };

    return property;
  };

  const to_object = (t) =>
  {
    const object =
      {
        name: t.name,
        note: '',

        properties: attributes.filter(a => t.id === a.TableId).map(to_property),
      };

    return object;
  };

  return tables.map(to_object);
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

async function run()
{
  const sequelize = await connect();

  const { tables, attributes, associations } = await init_metadata(sequelize);

  await sequelize.close();

  return read_objects({ tables, attributes, associations });

  // await sequelize.sync({ force: true });

  // await init_models(sequelize, { tables, attributes, associations });

  // const associations = await Association.findAll({ include: [{ model: Table, as: 'Source' }, { model: Table, as: 'Target' }] });

  // associations.forEach(value => console.log(value.toJSON()));

  // await create_dev_data(sequelize, { Table, Attribute, Association })

}

// run().catch(error => console.log(error));


const orm =
  {
    objects()
    {
      return run();
    }
  };


export default orm;
