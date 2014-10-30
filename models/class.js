"use strict";

module.exports = function(sequelize, DataTypes) {
  var Class = sequelize.define("Class", {
    name: DataTypes.STRING,
    googleId: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(db) {
        Class.hasMany(db.User);
      }
    }
  });

  return Class;
};
