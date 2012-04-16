Sajak - Simple Authenticated JSON API Kit
=========================================

Sajak is a small tool for building JSON APIs. It turns a list of models into a node.js app that handles routing, authentication, and authorization so that you can focus on your app instead of tedious RESTronautics.

Example
-------

To spin up a theoretical todo list backend, with authenticated users and authorized todo list items:

```javascript
var http = require("http")
  , sajak = require("sajak")
  , api = http.createServer()

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

server.on("request", sajak([User, TodoItem]))
server.listen(3000)
```

API
---

Coming soon.

Copyright
---------

Copyright (c) 2012 Jed Schmidt. See LICENSE.txt for details.

Send any questions or comments [here][twitter].

[twitter]: http://twitter.com/jedschmidt
