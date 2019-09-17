'use strict';

var Entity = require('../../models/EntityModel')
var Notifications = require('../../models/NotificationsModel')
const dbpool  = require('../models/db')








function transformToEntity(result){
  let response = []
  if(result instanceof Array){
    result.forEach(function(x){ response.push(new Entity(x)); })
  }
  return response;
}
exports.allEntities = function(req, res) {
  dbpool.query('select * from entity limit 10',(error,result) => {
    if(error) throw error;
    res.json(transformToEntity(result));
  });
};


exports.getEntity = function(req,res){
  dbpool.query('select * from entity where entity_uid = ?',req.params.id, (error,result) => {
    if(error) throw error;
    res.json(transformToEntity(result));
  });
}

  exports.getEntityGeoRadius = function(req,res){
    dbpool.query('select distinct e.*,l.*,r.distance  from entity e  '+
    'join location l on e.entity_uid = l.entity_uid '+
    'join ( SELECT location_uid, '+
          '( 3959 * acos ( cos ( radians(?) ) * cos( radians( LATITUDE ) ) * cos( radians( LONGITUDE ) - radians(?) ) + sin ( radians(?) ) * sin( radians( LATITUDE ) ) ) ) AS distance '+
          'FROM geo_location '+
          'HAVING distance < ? '+
          'ORDER BY distance ) r on r.location_uid = l.location_uid '+
      'order by distance asc',
    [req.params.lat,req.params.long,req.params.lat,req.params.distance], (error,result) => {
      if(error) throw error;
      res.json(transformToEntity(result));

    });

}


/*
What are the possible notifications types
- did you know - DYK
- new offering - NOF
- alert - LRT

*/
exports.dailyNotifications = function(req, res){
  dbpool.query('select * from notifications where valid = TRUE order by created_ts',
   (error,result) => {
    if(error) throw error;
    let response = []
    result.forEach(function(x){ response.push(new Notifications(x['ENTITY_UID'],x['TYPE'],x['TEXT'])); })
    res.json(response);

  });


}
