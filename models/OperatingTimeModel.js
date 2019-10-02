
function OperatingTime(values) {
      this.locationUID = values['LOCATION_UID']
      this.weekDay = values['DAY_OF_WEEK']
      this.openTime = values['OPEN_TIME']
      this.closeTime = values['CLOSE_TIME']
        console.log(values)
   }



module.exports = OperatingTime;
