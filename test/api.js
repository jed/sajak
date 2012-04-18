var sajak = require("../")

function User(attrs) {
  this.id = attrs.id
}

User.prototype.authorize = function(user, method, cb) {
  cb()
}

User.prototype.authenticate = function(auth, cb) {
  this.auth = auth
  cb()
}

User.prototype.fetch = function(cb) {
  cb(null, this)
}

module.exports = sajak([User])
