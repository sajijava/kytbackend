
var Location = require('./LocationModel')

function Entity(values) {
      this.companyName = values['COMPANY_NAME']
      this.entityUID = values['ENTITY_UID']
      this.numYears = values['NUM_YEARS']
      this.location = new Location(values);
        console.log(values)
   }



module.exports = Entity;
