Base router for your JS framework or frameworkless app

[![Build Status](https://travis-ci.org/apsavin/router-base.svg?branch=master)](https://travis-ci.org/apsavin/router-base) [![NPM version](https://badge.fury.io/js/router-base.svg)](http://badge.fury.io/js/router-base) [![Bower version](https://badge.fury.io/bo/router-base.svg)](http://badge.fury.io/bo/router-base)

It's abstract and knows nothing about http. It's just matches and generates urls.

##How to include it in my app or framework?

Router supports:

1. [node.js](http://nodejs.org) modules,
2. [requirejs](http://requirejs.org) modules
3. and, of course, awesome [ym](https://github.com/ymaps/modules) modules.
4. You can just use the `<script>` tag also, RouterBase will export the global variable then.

You can install it with npm:

```bash
$ npm install router-base
```

or bower:

```bash
$ bower install router-base
```

##How to use it?

###Very basic example

At first, you need to create an instance:

```javascript
var myRouter = new RouterBase({

    routes: myRoutes // routes config

});
```

Where routes config is an Array with objects, each object is a configuration for a route.
For example:

```javascript
var myRoutes = [{
    id: 'simplest_route',
    path: '/a/route'
}];

var myRouter = new RouterBase({
    routes: myRoutes
});

// You can generate routes by id:
myRouter.generate('simplest_route'); // '/a/route'

//You can find a route by path and method:
myRouter.match({path: '/a/route', method: 'GET'}); // {id: 'simplest_route'}
```

###Beautiful urls examples

####You can use named parameters in paths of the routes.
```javascript
var myRoutes = [{
    id: 'route_with_parameter_in_path',
    path: '/some/path/{parameter}'
}];

myRouter.generate('route_with_parameter_in_path'); // will throw an Error, because parameter is needed for the route
myRouter.generate('route_with_parameter_in_path', {parameter: 1}); // '/some/path/1'
myRouter.generate('route_with_parameter_in_path', {parameter: 'value'}); // '/some/path/value'

myRouter.match({path: '/some/path/', method: 'GET'}); // null
myRouter.match({path: '/some/path/to', method: 'GET'}); // {id: 'route_with_parameter_in_path', parameters: {parameter: 'to'}}
```
####Optional parameters in paths
```javascript
var myRoutes = [{
    id: 'route_with_parameter_in_path',
    path: '/some/path/{parameter}',
    defaults: {parameter: 1}
}];

myRouter.generate('route_with_parameter_in_path'); // '/some/path'
myRouter.generate('route_with_parameter_in_path', {parameter: 1}); // '/some/path/1'
myRouter.generate('route_with_parameter_in_path', {parameter: 'value'}); // '/some/path/value'

myRouter.match({path: '/some/path', method: 'GET'}); // {id: 'route_with_parameter_in_path', parameters: {parameter: 1}}
myRouter.match({path: '/some/path/to', method: 'GET'}); // {id: 'route_with_parameter_in_path', parameters: {parameter: 'to'}}
```
####Restricted parameters in paths
```javascript
var myRoutes = [{
    id: 'route_with_parameter_in_path',
    path: '/some/path/{parameter}',
    defaults: {parameter: 1},
    requirements: {parameter: '\\d+'}
}];

myRouter.generate('route_with_parameter_in_path'); // '/some/path'
myRouter.generate('route_with_parameter_in_path', {parameter: 1}); // '/some/path/1'
myRouter.generate('route_with_parameter_in_path', {parameter: 'value'}); // throws an Error, because parameter is not numeric

myRouter.match({path: '/some/path', method: 'GET'}); // {id: 'route_with_parameter_in_path', parameters: {parameter: 1}}
myRouter.match({path: '/some/path/to', method: 'GET'}); // null
```

##All possible routes parameters

1. id - String, required. You can use it to link a route to your controller.
2. path - String, required. Can include named parameters in `{parameterName}` form.
3. host - String, optional. Can include named parameters in `{parameterName}` form (For example, '{sub}.example.com').
4. defaults - Object, optional. Keys are parameters names, values are parameters default values.
5. requirements - Object, optional. You can use it to restrict parameters. Keys are parameters names, values are strings. Strings from values are for regular expressions, router uses it to test parameters.
6. methods - Array, optional. For example, `['GET']` to allow only `GET` methods.
7. schemes - Array, optional. For example, `['https']` to force https.

##RouterBase parameters

1. routes - an Array of routes configs, the only required parameter
2. defaultMethods - what methods available for routes, `['GET', 'POST', 'PUT', 'DELETE']` by default
3. defaultSchemes - what schemes available for routes, `['http', 'https']` by default
4. symbols.parametersDelimiters. By default, `.` and `/` can be used as parameters delimiters in paths
5. symbols.parameterStart, default value is '\{'
6. symbols.parameterMatcher, default value is '.*?'
7. symbols.parameterEnd, default value is '\}'

##Where is tests?
Of course, in `test` folder. Use `npm test` to run.
