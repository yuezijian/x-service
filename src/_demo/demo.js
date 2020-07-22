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

async function define_models(sequelize)
{
  models.map(model => sequelize.define(model.name, model.attributes, model.options))

  const Drug    = sequelize.models['Drug'   ];
  const Patient = sequelize.models['Patient'];
  const Order   = sequelize.models['Order'  ];

  Patient.hasMany(Order);
  Order.belongsTo(Patient);

  Order.hasOne(Drug);
  Drug.belongsTo(Order);

  await sequelize.sync({ force: true });
}

// 使用配置创建实例

async function create_entity(sequelize, data)
{
  // 一层层的分解 data，找到所有的 model 和属性

  const model = sequelize.models[name];

  // console.log(model.associations.Orders);

  const instance = await model.create(attributes);

  console.log(instance.associations);

  return instance;
}

async function demo()
{
  const sequelize = await connect();

  await define_models(sequelize);

  const data =
    {
      Patient:
        {
          name: '患者1',

          Order:
            {
              name: '医嘱1'
            }
        }
    };

  const entity = await create_entity(sequelize, data);

  // console.log(entity);

  await sequelize.close();
}


demo().catch(error => console.log(error));
