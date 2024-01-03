'use strict'
const {Model} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsTo(models.Allcode, {
        foreignKey: 'gender',
        targetKey: 'keyMap',
        as: 'genderData'
      })
      User.hasOne(models.Markdown, {
        foreignKey: 'staffId'
      })
      User.hasOne(models.Staff_Info, {
        foreignKey: 'staffId'
      })

      User.hasMany(models.Schedule, {
        foreignKey: 'staffId',
        as: 'staffData'
      })
      User.hasMany(models.Booking, {
        foreignKey: 'customerId',
        as: 'customerData'
      })
    }
  }
  User.init(
    {
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      address: DataTypes.STRING,
      phonenumber: DataTypes.STRING,
      gender: DataTypes.STRING,
      image: DataTypes.STRING,
      roleId: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'User'
    }
  )
  return User
}
