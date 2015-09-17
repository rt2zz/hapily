var Hapi = require('hapi')
var _ = require('lodash')
var chalk = require('chalk')

var createRoutes = require('./createRoutes')

module.exports = function(config){
  var server = new Hapi.Server()

  _.each(config.connections, function(connection){
    server.connection(connection)
  })

  var routes = createRoutes(config.routes)

  if(config.decorate){
    _.each(config.decorate, function(setup){
      server.decorate(setup.type, setup.property, setup.method)
    })
  }

  server.register(config.plugins, function(err){
    if(err) throw err
    server.route(routes)
  })

  //log all requests
  server.ext('onRequest', function(request, reply){
    console.log(chalk.black.bgGreen('  '), chalk.bold(pad7(request.method.toUpperCase())), chalk.green(request.path))
    return reply.continue()
  })
  //standardize payload/query under data
  server.ext('onPreHandler', function(request, reply){
    request.data = request.method === 'get' ? request.query : request.payload
    return reply.continue()
  })

  server.start(function(){
    console.log('API : ' + server.info.uri);
  })
}

function pad7(s){
  var l = s.length
  for(var i=0; i<7-l; i++){
    s+=' '
  }
  return s
}
