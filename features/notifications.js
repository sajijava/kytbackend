'use strict';
var Entity = require('../models/EntityModel')
var Notifications = require('../models/NotificationsModel')
const dbpool  = require('../api/models/db')




function getDYKNotifications(){
  return new Promise((resolve, reject) => {
    dbpool.query('select * from entity e  join location l on e.entity_uid = l.entity_uid  order by num_years desc limit 1',
      (error,result) => {
                  if(error) reject(error);

                  let note = new Notifications();

                  result.forEach(function(x){
                      let ent = new Entity(x);
                      note.type = 'DYK'
                      note.entityid = ent.entityUID
                      note.text = "...that "+ent.companyName+" has been in operation, in the "+ent.location.city +" area for over "+ent.numYears+" yrs.";
                    })

                  resolve(note);
    })
  })
}

function getLRTNotifications(){
  return new Promise((resolve, reject) => {
    dbpool.query('select * from entity e  join location l on e.entity_uid = l.entity_uid  order by num_years asc limit 1',
      (error,result) => {
                  if(error) reject(error);

                  let note = new Notifications();

                  result.forEach(function(x){
                      let ent = new Entity(x);
                      note.type = 'LRT'
                      note.entityid = ent.entityUID
                      note.text = ent.companyName+" in ("+ent.location.city +", "+ent.location.state+" "+ent.location.zip+") will be closed today as every one has flu.";
                    })

                  resolve(note);
    })
  })
}

function getNOFNotifications(){
  return new Promise((resolve, reject) => {
    dbpool.query('select * from entity e  join location l on e.entity_uid = l.entity_uid  where l.zip = "07095" order by num_years asc limit 1',
      (error,result) => {
                  if(error) reject(error);

                  let note = new Notifications();

                  result.forEach(function(x){
                      let ent = new Entity(x);
                      note.type = 'NOF'
                      note.entityid = ent.entityUID
                      note.text = ent.companyName+" in ("+ent.location.city +", "+ent.location.state+" "+ent.location.zip+") has new management. They have updated the menu, make time to visit them this weekend. ";
                    })

                  resolve(note);
    })
  })
}

/*
What are the possible notifications types
- did you know - DYK
- new offering - NOF
- alert - LRT

*/
exports.generateNewNotifications = function(){
  console.log("Generating new notification")
    Promise.all([
      getDYKNotifications().catch( error => console.log(error)),
      getLRTNotifications().catch( error => console.log(error)),
      getNOFNotifications().catch( error => console.log(error))
    ])
    .then(values => {
      //noti.push(values)
      console.log(values)
      values.forEach((x) => {

          dbpool.query("INSERT INTO NOTIFICATIONS ( ENTITY_UID ,  TYPE ,  TEXT  ) VALUES (?,?,?)" ,[x.entityid, x.type, x.text],(error,result) => {
                      if(error) throw error;})
      })
    })



}
