module.exports = (sequelize, DataTypes) => {
  const UserActivation = sequelize.define('UserActivation', {
    token: DataTypes.STRING,
    user_id: DataTypes.INTEGER
  }, {
    tableName: 'users_activations',
    timestamps: false
  });

  return UserActivation;
};
