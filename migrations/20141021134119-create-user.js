module.exports = {
  up: function(migration, DataTypes, done) {
    console.log("Running migration for users");
    // add altering commands here, calling 'done' when finished
    migration.createTable('Users',
      {id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      googleId : DataTypes.STRING,
      accessToken: DataTypes.STRING,
      refreshToken: DataTypes.STRING
    })
    .complete(done);
  },
  down: function(migration, DataTypes, done) {
    // add reverting commands here, calling 'done' when finished

    migration.dropTable('Users')
      .complete(done);
  }
};

