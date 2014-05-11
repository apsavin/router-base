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
        'match method': checkMatchMethod(routes, require('./match-data')),
        'generate method': checkGenerateMethod(routes, require('./generate-data'))
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
        var routesCount = routes.length - 2;
        if (i < routesCount) {
            route = routes[i];
        } else if (i < routesCount * 2) {
            route = routes[routesCount].routes[i - routesCount];
        } else {
            route = routes[routesCount + 1].routes[i - routesCount * 2];
        }
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
        try {
            assert.equal(router.generate(input.id, input.parameters), output);
        } catch (e) {
            if (e.name === 'AssertionError') {
                throw e;
            } else {
                assert.strictEqual(output, undefined);
            }
        }
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
