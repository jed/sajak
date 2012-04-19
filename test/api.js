var sajak = require("../")

function User(attrs) {
  this.id = attrs.id
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

notes = [
  {id: 0, user: "sajak", text: "Hello world."},
  {id: 1, user: "sajak", text: "Hello again."},
  {id: 2, user: "sajxck_", text: "Hello world."}
]

function Note(attrs) {
  this.id = attrs.id
}

Note.prototype = {
  authorize: function(user, method, next) {
    this.fetch(function(err, note) {
      if (note && note.user != user.id) {
        return next(new Error)
      }

      next()
    })
  },

  save: function(cb) {
    if (!(this.user instanceof User)) {
      cb(new Error("User required."))
    }

    if ("id" in this) notes[this.id] = this

    else this.id = notes.push(this)

    cb(null, this)
  },

  fetch: function(cb) {
    if (!(this.id in notes)) {
      return cb(new Error)
    }

    cb(null, notes[this.id])
  }
}

module.exports = sajak([User, Note])
