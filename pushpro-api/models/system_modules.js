// 'use strict';
// const {
//   Model
// } = require('sequelize');
// module.exports = (sequelize, DataTypes) => {
//   class system_modules extends Model {
//     /**
//      * Helper method for defining associations.
//      * This method is not a part of Sequelize lifecycle.
//      * The `models/index` file will call this method automatically.
//      */
//     static associate(models) {
//       // define association here
//     }
//   }
//   system_modules.init({
//     module_name: DataTypes.STRING,
//     action: DataTypes.JSON,
//     slug: DataTypes.STRING,
//     icon: DataTypes.STRING,
//     parent_module_id: DataTypes.INTEGER,
//     is_permissible: DataTypes.BOOLEAN,
//     status: DataTypes.BOOLEAN,
//     display_order: DataTypes.INTEGER
//   }, {
//     sequelize,
//     modelName: 'system_modules',
//   });
//   return system_modules;
// };

// models/system_modules.js
module.exports = (sequelize, DataTypes) => {
  const SystemModule = sequelize.define('SystemModule', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    module_name: DataTypes.STRING,
    action: DataTypes.JSON,
    slug: DataTypes.STRING,
    icon: DataTypes.STRING,
    parent_module_id: DataTypes.INTEGER,
    is_permissible: DataTypes.BOOLEAN,
    status: DataTypes.BOOLEAN,
    display_order: DataTypes.INTEGER,
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'system_modules',
  });

  SystemModule.associate = (models) => {
    SystemModule.hasMany(models.SystemModule, {
      as: 'sub_modules',
      foreignKey: 'parent_module_id',
    });
  };

  return SystemModule;
};
