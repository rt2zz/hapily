var Joiify = require('joiify')
var _ = require('lodash')

// converts endpoint('METHOD path/') and manifest({auth, validate, handler}) to a hapi route
module.exports = function(routeMaps){
  if(!Array.isArray(routeMaps)){ routeMaps = [routeMaps] }

  return _.filter(_.flatten(_.map(routeMaps, function(routeMap){
    return _.map(routeMap, function(manifest, endpoint){
      if(endpoint === 'defaults'){ return undefined }
      var route = {}

      if(!manifest || !endpoint){
        console.log('ERR missing manifest or endpoing', manifest, endpoint)
      }

      var parts = endpoint.split(' ')
      var path = '/' + parts[1]
      if(routeMap.defaults && routeMap.defaults.pathPrefix){ path = '/' + routeMap.defaults.pathPrefix + path }
      var method = parts[0]

      route.method = method
      route.path = path
      route.config = route.config || {}
      route.config.payload = manifest.payload ? manifest.payload : null
      route.config.validate = route.config.validate || {}

      var validate = undefined
      if(typeof manifest.validate !== 'undefined'){
        validate = manifest.validate !== null && manifest.validate.isJoi ? manifest.validate : Joiify(manifest.validate)
      }

      var validationKey = method === 'GET' ? 'query' : 'payload'
      route.config.validate[validationKey] = validate

      if(routeMap.defaults && routeMap.defaults.auth){ route.config.auth = routeMap.defaults.auth }
      if(typeof manifest.auth !== 'undefined'){ route.config.auth = manifest.auth }

      route.handler = manifest.handler
      return route
    })
  })))
}
