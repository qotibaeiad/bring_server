class User {
    constructor(name, phoneNumber) {
      if (User.instance) {
        return User.instance;
      }
  
      this.name = name;
      this.phoneNumber = phoneNumber;
  
      // Ensure only one instance is created
      User.instance = this;
    }
  }

  module.exports = User;
s