var http    = require("http")
  , should  = require("should")
  , request = require("request")
  , api     = require("./api")
  , server  = http.createServer(api.router)

describe("sajak", function() {
  before(function(done) {
    server.listen(8000, done)
  })

  describe("routing", function() {
    it("should return 200 for root", function(done) {
      request("http://sajak:pass@localhost:8000/", function(err, res, body) {
        res.statusCode.should.eql(200)
        done()
      })
    })

    it("should return 200 for valid model", function(done) {
      request("http://sajak:pass@localhost:8000/notes/0", function(err, res, body) {
        res.statusCode.should.eql(200)
        done()
      })
    })

    it("should return 404 for invalid model", function(done) {
      request("http://sajak:pass@localhost:8000/unknowkn_model", function(err, res, body) {
        res.statusCode.should.eql(404)
        done()
      })
    })

    it("should return 405 for invalid action", function(done) {
      request.del("http://sajak:pass@localhost:8000/notes/1", function(err, res, body) {
        res.statusCode.should.eql(405)
        done()
      })
    })
  })

  describe("authentication", function() {
    it("should return 200 for valid user/password", function(done) {
      request("http://sajak:pass@localhost:8000/", function(err, res, body) {
        res.statusCode.should.eql(200)
        done()
      })
    })

    it("should return 401 for missing auth", function(done) {
      request("http://localhost:8000/", function(err, res, body) {
        res.statusCode.should.eql(401)
        done()
      })
    })

    it("should return 401 for incorrect password", function(done) {
      request("http://sajak:wrongpass@localhost:8000/", function(err, res, body) {
        res.statusCode.should.eql(401)
        done()
      })
    })

    it("should return 401 for incorrect user", function(done) {
      request("http://notsajak:pass@localhost:8000/", function(err, res, body) {
        res.statusCode.should.eql(401)
        done()
      })
    })
  })

  describe("authorization", function() {
    it("should return 200 for authorized resource", function(done) {
      request("http://sajak:pass@localhost:8000/notes/0", function(err, res, body) {
        res.statusCode.should.eql(200)
        done()
      })
    })

    it("should return 403 for unauthorized resource", function(done) {
      request("http://sajak:pass@localhost:8000/notes/2", function(err, res, body) {
        res.statusCode.should.eql(403)
        done()
      })
    })
  })

  describe("request", function() {
    it("should return 400 for invalid json", function(done) {
      request.post({
        url: "http://sajak:pass@localhost:8000/notes",
        json: true,
        body: "THIS IS SO NOT JSON."
      }, function(err, res, body) {
        res.statusCode.should.eql(400)
        done()
      })
    })

    it("should resolve/reify hrefs in the body", function(done) {
      request.post({
        url: "http://sajak:pass@localhost:8000/notes",
        json: true,
        body: '{"user.href": "/users/sajak", "text": "Buy a vowel."}'
      }, function(err, res, body) {
        body.user.should.have.property("id", "sajak")
        res.statusCode.should.eql(200)
        done()
      })
    })
  })

  describe("response", function() {
    it("should have content-length", function(done) {
      request("http://sajak:pass@localhost:8000/", function(err, res, body) {
        res.headers.should.have.property("content-length")
        done()
      })
    })

    it("should have content-type 'application/json'", function(done) {
      request("http://sajak:pass@localhost:8000/", function(err, res, body) {
        res.should.be.json
        done()
      })
    })

    it("should be valid JSON", function(done) {
      request("http://sajak:pass@localhost:8000/", function(err, res, body) {
        (function(){ JSON.parse(body) }).should.not.throw()
        done()
      })
    })

    it("should return a list of endpoints at / by default", function(done) {
      request("http://sajak:pass@localhost:8000/", function(err, res, body) {
        body = JSON.parse(body)

        var data = body.map(function(x){ return x.type })
        data.should.have.property("length", 2)

        data.should.eql(Object.keys(api.models))

        done()
      })
    })
  })

  after(function(done) {
    server.close()
    done()
  })
})
