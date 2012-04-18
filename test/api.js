var sajak = require("../")

function User(attrs) {
  this.id = attrs.id
}

User.prototype.authorize = function(user, method, next) {
  if (this.id != user.id) {
    return next(new Error("Users cannot access other user profiles."))
  }

  next()
}

User.prototype.authenticate = function(auth, next) {
  if (!auth.scheme) {
    return next(new Error("Authentication required."))
  }

  if (auth.scheme.toLowerCase() != "password") {
    return next(new Error("Only basic authentication accepted"))
  }

  if (auth.token.password != "pass" || auth.token.username != "sajak") {
    return next(new Error("Incorrect username/password"))
  }

  this.id = auth.token.username

  next()
}

User.prototype.fetch = function(cb) {
  cb(null, this)
}

function Note() {}

Note.prototype.fetch = function(cb) {
  cb(null, this)
}

module.exports = sajak([User, Note])
