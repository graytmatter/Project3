"use strict";

module.exports = function(sequelize, DataTypes) {
  var ClassesUsers = sequelize.define("ClassesUsers", {
    UserId: DataTypes.INTEGER,
    ClassId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });

  return ClassesUsers;
};
