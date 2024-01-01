'use strict'
const {Model} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Staff_Info extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Staff_Info.belongsTo(models.User, {
        foreignKey: 'staffId',
        as: 'markdownData'
      })

      Staff_Info.belongsTo(models.Allcode, {
        foreignKey: 'priceId',
        targetKey: 'keyMap',
        as: 'priceTypeData'
      })
      Staff_Info.belongsTo(models.Allcode, {
        foreignKey: 'paymentId',
        targetKey: 'keyMap',
        as: 'paymentTypeData'
      })
    }
  }
  Staff_Info.init(
    {
      staffId: DataTypes.INTEGER,
      priceId: DataTypes.STRING,
      paymentId: DataTypes.STRING,
      note: DataTypes.STRING,
      count: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'Staff_Info',
      freezeTableName: true
    }
  )
  return Staff_Info
}
