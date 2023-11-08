'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Staff_Room_Specialty extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    Staff_Room_Specialty.init({
        staffId: DataTypes.INTEGER,
        roomId: DataTypes.INTEGER,
        specialtyId: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'Staff_Room_Specialty',
    });
    return Staff_Room_Specialty;
};