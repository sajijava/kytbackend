function Location(values) {
     this.street = values['STREET']
     this.city = values['CITY']
     this.state = values['state']
     this.zip = values['ZIP']
     this.phone = values['PHONE']
     console.log(values)
  }


module.exports = Location;
