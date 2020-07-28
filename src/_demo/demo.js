import { Sequelize, Model } from 'sequelize';

import models from './models';


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

async function define_models(sequelize, reset = false)
{
  models.map(model => sequelize.define(model.name, model.attributes, model.options))

  const Drug    = sequelize.models['Drug'   ];
  const Patient = sequelize.models['Patient'];
  const Order   = sequelize.models['Order'  ];

  Patient.hasMany(Order);
  Order.belongsTo(Patient, { as: 'patient', foreignKey: 'PatientId' });

  Order.hasOne(Drug);
  Drug.belongsTo(Order);

  await sequelize.sync({ force: reset });

  // 期望生成相关 GraphQL 结构
  ;
}

// 使用配置创建实例

async function create_entity(sequelize, name, attributes)
{
  const model = sequelize.models[name];

  return model.create(attributes);
}

async function find_entity(sequelize, name)
{
  const model = sequelize.models[name];

  return model.findOne();
}

async function create_data(sequelize)
{
  const patient = await create_entity(sequelize, 'Patient', { name: '患者1' });

  const order = await create_entity(sequelize, 'Order', { name: '医嘱1', PatientId: patient.id });

  const drug = await create_entity(sequelize, 'Drug', { name: '药品1', OrderId: order.id });
}

async function run()
{
  const sequelize = await connect();

  await define_models(sequelize, true);

  await create_data(sequelize);

  const entity = await find_entity(sequelize, 'Patient');

  console.log(entity.toJSON());

  await sequelize.close();
}


// run().catch(error => console.log(error));


const demo =
  {
    async init()
    {
      const sequelize = await connect();

      await define_models(sequelize, true);

      await create_data(sequelize);

      await sequelize.close();
    },

    async one_entity(name)
    {
      const sequelize = await connect();

      await define_models(sequelize);

      const entity = await find_entity(sequelize, name);

      await sequelize.close();

      return entity;
    }
  };


export default demo;
