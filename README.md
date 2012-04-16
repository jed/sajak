Sajak - Simple Authenticated JSON API Kit
=========================================

Sajak is a small tool for building JSON APIs. It turns a list of models into a node.js app that handles routing, authentication, and authorization by convention so that you can focus on your app instead of tedious RESTronautics.

Example
-------

To spin up a theoretical todo list backend, with authenticated users and authorized todo list items:

```javascript
var http = require("http")
  , sajak = require("sajak")
  , server = http.createServer()

function User(){ ... }
User.prototype = {
  authenticate: function(auth, cb){ ... },
  save: function(cb){ ... },
  fetch: function(cb){ ... }
}

function TodoItem(){ ... }
TodoItem.prototype = {
  authorize: function(user, action, cb){ ... },
  save: function(cb){ ... },
  fetch: function(cb){ ... },
  destroy: function(cb){ ... }
}

server.on("request", sajak([User, TodoItem]).router)
server.listen(3000)
```

How it works
------------

Sajak returns a simple http listener. Upon every request, it:

- parses incoming query, body, and auth data into JavaScript objects,
- resolves any model URLs in the request into actual model instances,
- calls the user's `authenticate` method to authenticate the user,
- calls the resource's `authorize` method to authorize the user action,
- calls `fetch`/`save`/`destroy` on the resource as per the request method, and
- serializes and returns the results to the client.

Since a Sajak app is just a listener, it can be used standalone, or as middleware in any Express/Connect app. With Express, any requests that don't match or return an error are passed to `next`, as with any other middleware.

API
---

### api = sajak(models)

Instantiates a Sajak app, passing any optional model constructors to the `serve` method.

### api.serve(...)

Serves the specified models. This method comes in a few flavors:

- `api.serve(name, Ctor)` serves a model at the specified name.
- `api.serve(Ctor)` serves a model at the default name, which is the lowercase, pluralized name of the constructor.
- `api.serve([Ctor, Ctor])` serves multiple models using the default names
- `api.serve({name: Ctor, name: Ctor})` serves multiple models using the specified names.

To serve the root endpoint, use an empty string for the model name.

### api.router

The router that can be passed to `createServer` for the node.js http module, or to `use` for Express.

Copyright
---------

Copyright (c) 2012 Jed Schmidt. See LICENSE.txt for details.

Send any questions or comments [here][twitter].

[twitter]: http://twitter.com/jedschmidt
