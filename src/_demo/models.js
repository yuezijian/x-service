import { DataTypes } from 'sequelize';


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


export default models;
