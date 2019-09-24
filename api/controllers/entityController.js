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
  dbpool.query('SELECT * FROM ENTITY LIMIT 10',(error,result) => {
    if(error) throw error;
    res.json(transformToEntity(result));
  });
};


exports.getEntity = function(req,res){
  dbpool.query('SELECT * FROM ENTITY WHERE entity_uid = ?',req.params.id, (error,result) => {
    if(error) throw error;
    res.json(transformToEntity(result));
  });
}

  exports.getEntityGeoRadius = function(req,res){
    dbpool.query('SELECT distinct e.*,l.*,r.distance  FROM ENTITY e  '+
    'JOIN LOCATION l ON e.entity_uid = l.entity_uid '+
    'JOIN ( SELECT location_uid, '+
          '( 3959 * acos ( cos ( radians(?) ) * cos( radians( LATITUDE ) ) * cos( radians( LONGITUDE ) - radians(?) ) + sin ( radians(?) ) * sin( radians( LATITUDE ) ) ) ) AS distance '+
          'FROM GEO_LOCATION '+
          'HAVING distance < ? '+
          'ORDER BY distance ) r ON r.location_uid = l.location_uid '+
      'ORDER BY distance asc',
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
  dbpool.query('SELECT * FROM NOTIFICATIONS WHERE valid = TRUE ORDER BY created_ts',
   (error,result) => {
    if(error) throw error;
    let response = []
    console.log("Query Results")
    console.log(result.length())
    result.forEach(function(x){ response.push(new Notifications(x['ENTITY_UID'],x['TYPE'],x['TEXT'])); })
    console.log(response)
    res.json(response);

  });


}
