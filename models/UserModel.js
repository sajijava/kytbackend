function User(values) {
     this.userid = values['ID']
     this.firstName = values['FIRST_NAME']
     this.lastName = values['LAST_NAME']
     this.email = values['EMAIL']
     this.password = values['PASSWORD']
     this.secret = values['SECRET_CODE']

     console.log("in User Model")
     console.log(values)
  }


module.exports = User;
