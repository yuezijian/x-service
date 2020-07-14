import { Sequelize, Model, DataTypes } from 'sequelize';


const models =
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

      options:
        {
          timestamps: false
        }
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

      options:
        {
          timestamps: false
        }
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
          timestamps: false,

          paranoid: true  // 软删除
        }
    }
  ];


async function connect()
{
  const connection = 'postgres://admin:admin@localhost:5432/postgres';

  const define = { freezeTableName: true };
  const logging = false;  // (...message) => console.log(message)

  const sequelize = new Sequelize(connection, { define, logging });

  await sequelize.authenticate();

  return sequelize;
}


// 根据配置定义 Model

async function define_models(sequelize)
{
  models.map(model => sequelize.define(model.name, model.attributes, model.options))

  // const Drug    = sequelize.models['Drug'   ];
  const Patient = sequelize.models['Patient'];
  const Order   = sequelize.models['Order'  ];

  Patient.hasMany(Order);
  Order.belongsTo(Patient);

  await sequelize.sync({ force: true });
}

// 使用配置创建实例

async function create_instance(sequelize, name, attributes)
{
  const model = sequelize.models[name];

  console.log(model.associations.Orders);

  const instance = await model.create(attributes);

  return instance;
}

async function demo()
{
  const sequelize = await connect();

  await define_models(sequelize);

  const patient = await create_instance(sequelize, 'Patient', { name: '患者1' });

  // console.log(patient);

  // {
  //   const order = await Order.create({ name: '医嘱1' });
  //
  //   await patient.addOrder(order);
  // }
  // {
  //   const order = await Order.create({ name: '医嘱2' });
  //
  //   await order.setPatient(patient);
  // }
  // {
  //   const order = await patient.createOrder({ name: '医嘱3'});
  //
  //   const same_patient = await order.getPatient();
  //
  //   console.log(same_patient.toJSON());
  // }
  // {
  //   const orders = await patient.getOrders({ include: Patient });
  //
  //   orders.forEach(order => console.log(order.toJSON()));
  // }

  await sequelize.close();
}


demo().catch(error => console.log(error));
