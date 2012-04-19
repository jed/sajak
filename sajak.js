var url = require("url")
  , debug = process.env.NODE_ENV != "production"

function App(models) {
  this.models = Object.create(null)

  if (models) this.serve(models)

  this.router = this.router.bind(this)
}

App.showStack = debug
App.indent = 2 * debug

App.nameModel = function(Model) {
  if (!Model.name) throw new Error("Models must be named.")

  return App.pluralize(Model.name).toLowerCase()
}

App.pluralize = function(word) {
  return word.replace(/(?:ch|o|s|sh|ss|x|y)?$/, function(end) {
    return end == "y" ? "ies" : end ? end + "es" : "s"
  })
}

App.parseAuth = function(req) {
  var header = req.headers.authorization
    , auth = header && header.match(/^(.+?) (.+)$/)

  if (!auth) return {}

  auth = {
    scheme: auth[1],
    token: auth[2]
  }

  if (auth.scheme.toLowerCase() == "basic") {
    auth = Buffer(auth.token, "base64").toString().split(":")

    auth = {
      scheme: "password",
      token: {username: auth[0], password: auth[1]}
    }
  }

  return auth
}

App.getBody = function(req, cb) {
  var body

  if (req._body) return cb(req.body)

  req._body = true
  body = ""

  req.setEncoding("utf8")

  req.on("data", function(chunk) {
    body += chunk
  })

  req.on("end", function() {
    if (!body) body = "{}"

    try { cb(null, JSON.parse(body)) }
    catch (err) { cb(err) }
  })
}

App.actions = {
  GET    : "fetch",
  POST   : "save",
  PUT    : "save",
  DELETE : "destroy"
}

App.prototype.fetch = function(cb) {
  cb(null, Object
    .keys(this.models)
    .filter(Boolean)
    .map(function(key) {
      return {type: key, href: "/" + key }
    })
  )
}

App.prototype.serve = function(name, Model) {
  var type = toString.call(name).slice(8, -1)

  switch (type) {
    case "Array":
      name.forEach(this.serve, this)
      break

    case "Object":
      Object.keys(name).forEach(function(key) {
        this.serve(key, name[key])
      }, this)
      break

    case "Function":
      this.serve(App.nameModel(name), name)
      break

    case "String":
      if (Model.prototype.authenticate) this.User = Model
      this.models[name] = Model
      break

    default:
      throw new Error("Invalid model name: " + name)
  }

  return this
}

App.prototype.authorize = function(user, method, cb) {
  cb()
}

App.prototype.router = function(req, res, next) {
  var resource = this.resolve(req.url)
    , allows
    , auth
    , action
    , user
    , authorize
    , app

  if (!next) next = function(err) {
    var data

    if (!err) {
      err = new Error("Not Found")
      err.status = 404
    }

    res.statusCode = err.status || 500

    data = {
      type: "error",
      message: err.message,
    }

    if (App.showStack) data.stack = err.stack.split(/\n\s*/).slice(1)

    res.json(data)
  }

  if (!res.json) res.json = function(data) {
    try {
      data = new Buffer(JSON.stringify(data, null, App.indent))
      res.setHeader("Content-Type", "application/json; charset=utf-8")
      res.setHeader("Content-Length", data.length)
      res.end(data)
    }

    catch (err) { next(err) }
  }

  if (!resource) return next()

  allows = ["HEAD"]
  if (resource.fetch) allows.push("GET")
  if (resource.save) allows.push("POST", "PUT")
  if (resource.destroy) allows.push("DELETE")

  res.setHeader("Allow", allows.join(", "))

  app       = this
  auth      = App.parseAuth(req)
  action    = App.actions[req.method]
  user      = new this.User({})
  authorize = resource.authorize || this.authorize

  App.getBody(req, function(err, data) {
    if (err) {
      err.status = 400
      return next(err)
    }

    Object.keys(data).forEach(function(key) {
      if (key.slice(-5) != ".href") return

      data[key.slice(0, -5)] = app.resolve(data[key])
      delete data[key]
    })

    user.authenticate(auth, function(err) {
      if (err) {
        err.status = 401
        return next(err)
      }

      authorize.call(resource, user, action, function(err) {
        if (err) {
          err.status = 403
          return next(err)
        }

        Object.keys(data).forEach(function(key) {
          resource[key] = data[key]
        })

        if (!resource[action]) {
          err = new Error("Method Not Allowed")
          err.status = 405
          return next(err)
        }

        resource[action](function(err, data) {
          if (err) return next(err)

          res.json(data)
        })
      })
    })
  })
}

App.prototype.resolve = function(uri) {
  uri = url.parse(uri, true)

  var segments = uri.pathname.split("/")
    , query = uri.query
    , type = segments[1]
    , id = segments[2]
    , Model = this.models[type]
    , instance

  if (!Model && !type) return this

  if (!Model || segments[3]) return

  if (id) query.id = id

  Object.keys(query).forEach(function(key) {
    if (key.slice(-5) != ".href") return

    query[key.slice(0, -5)] = this.resolve(query[key])
    delete query[key]
  }, this)

  instance = new Model(query)
  instance.constructor = Model

  return instance
}

App.prototype.User = User

function User(){}
User.prototype.authenticate = function(credentials, cb) {
  this.credentials = credentials
  cb()
}

function sajak(models) {
  return new App(models)
}

module.exports = sajak
