var http    = require("http")
  , should  = require("should")
  , request = require("request")
  , api     = require("./api")
  , server  = http.createServer(api.router)

describe("sajak", function() {
  before(function(done) {
    server.listen(3000, done)
  })

  describe("headers", function() {

  })

  describe("authentication", function() {

  })

  describe("authorization", function() {

  })

  describe("response", function() {

  })

  before(function() {
    server.close()
  })
})
