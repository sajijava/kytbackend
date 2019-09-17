'use strict';
module.exports  = (sequelize, type) => {
  const Entity  = sequelize.define('entity',{
    entityUid: {type: type.STRING},
    companyName: {type:  type.STRING},
    numYears: {type: type.INTEGER}
  },{
    freezeTableName: true,
    tableName:'ENTITY',
    paranoid: true,
    timestamps: false,
    underscored: true,

  });

  return Entity;
}
