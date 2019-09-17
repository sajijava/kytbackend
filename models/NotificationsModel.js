

function Notifications(entityid,type,text){
    this.type = type || null;
    this.text  = text  || null;
    this.entityid  = entityid  || null;
 }


Notifications.prototype.setType = function(type){
    this.type = type;
  }
Notifications.prototype.getType = function(){
    return this.type;
  }

Notifications.prototype.setText = function(text){
      this.text = text;
  }
Notifications.prototype.getText = function(){
    return this.text;
  }



module.exports = Notifications;
