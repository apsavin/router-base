var vows = require('vows'),
    assert = require('assert'),
    RouterBase = require('../lib/router-base'),
    routes = require('./routes');


vows.describe('router').addBatch({
    'router-base': {
        topic: function () {
            return new RouterBase({
                routes: routes
            });
        },
        'match method': checkMatchMethod(routes, [
            [
                [
                    {path: '/a/route', method: 'GET'},
                    {id: 'simplest_route'}
                ],
                [
                    {path: '/a/rote', method: 'GET'},
                    null
                ]
            ],
            [
                {path: '/b/route', method: 'GET'},
                {id: 'simplest_route_with_default_parameter', parameters: {action: 'defaultAction'}}
            ],
            [
                [
                    {path: '/c/5', method: 'GET'},
                    {id: 'route_with_required_parameter', parameters: {action: 'defaultAction', parameter: 5}}
                ],
                [
                    {path: '/c', method: 'GET'},
                    null
                ]
            ]
        ]),
        'generate method': checkGenerateMethod(routes, [
            [
                {id: 'simplest_route'},
                '/a/route'
            ]
        ])
    }
}).export(module);

/**
 * @param {{path: String, method: String}} input
 * @param {{id: String, parameters: ?Object.<String>}} output
 * @returns {Function}
 */
function checkMatchRoute (input, output) {
    return function (router) {
        var matchers = router.match(input);
        if (output === null) {
            assert.equal(matchers, output);
            return;
        }
        assert.notEqual(matchers, null);
        assert.equal(matchers.id, output.id);
        if (output.parameters) {
            for (var key in output.parameters) {
                if (output.parameters.hasOwnProperty(key)) {
                    assert.equal(output.parameters[key], matchers.parameters[key]);
                }
            }
        }
    };
}

/**
 * @param {Array.<RouteDefinition>} routes
 * @param {Array.<Array.<Object>>} parameters
 * @param {Function} methodTestGenerator
 * @returns {Object.<Function>}
 */
function checkMethod (routes, parameters, methodTestGenerator) {
    var tests = {}, id = 0,
        route;

    function generateMethod (parameter) {
        if (Array.isArray(parameter[0])) {
            parameter.forEach(generateMethod);
            return;
        }
        tests[route.id + '_' + (id++)] = methodTestGenerator(parameter[0], parameter[1]);
    }

    parameters.forEach(function (parameter, i) {
        route = routes[i];
        id = 0;
        generateMethod(parameter);
    });
    return tests;
}

/**
 * @param {Array.<RouteDefinition>} routes
 * @param {Array.<Array.<Object>>} parameters
 * @returns {Object.<Function>}
 */
function checkMatchMethod (routes, parameters) {
    return checkMethod(routes, parameters, checkMatchRoute);
}

/**
 * @param {{id: String, parameters: ?Object.<String>}} input
 * @param {?String} output
 */
function checkGenerateRoute (input, output) {
    return function (router) {
        assert.equal(router.generate(input.id, input.parameters), output);
    };
}

/**
 * @param {Array.<RouteDefinition>} routes
 * @param {Array.<Array.<Object>>} parameters
 * @returns {Object.<Function>}
 */
function checkGenerateMethod (routes, parameters) {
    return checkMethod(routes, parameters, checkGenerateRoute);
}
