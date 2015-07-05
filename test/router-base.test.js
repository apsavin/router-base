var mochaOOPWrapper = require('mocha-oop-wrapper'),
    expect = require('chai').expect,
    RouterBase = require('../lib/router-base'),
    routes = require('./data/routes'),
    assign = require('lodash.assign');

/**
 * @class RouterBaseTest
 * @extends mochaOOPWrapper
 */
var RouterBaseTest = function () {
    this._initTests();
};

RouterBaseTest.prototype = assign(Object.create(mochaOOPWrapper), /** @lends RouterBaseTest# */{
    /**
     * @protected
     * @string
     */
    _name: 'RouterBase',

    /**
     * @protected
     */
    _describe: function () {
        this.before(function () {
            this._router = new RouterBase({
                routes: routes
            });
        });

        this.describe('match method', this._checkMatchMethod);
        this.describe('generate method', this._checkGenerateMethod);
    },

    /**
     * @private
     */
    _checkMatchMethod: function () {
        this._checkMethod(require('./data/match-data'), this._checkMatchRoute);
    },

    /**
     * @private
     */
    _checkGenerateMethod: function () {
        this._checkMethod(require('./data/generate-data'), this._checkGenerateRoute);
    },

    /**
     * @param {Array.<Array.<Object>>} parameters
     * @param {Function} methodTestGenerator
     * @returns {Object.<Function>}
     */
    _checkMethod: function (parameters, methodTestGenerator) {
        var id = 0,
            route;

        function generateMethod (parameter) {
            if (Array.isArray(parameter[0])) {
                parameter.forEach(generateMethod, this);
                return;
            }

            this.it(route.id + '_' + (id++), methodTestGenerator.bind(this, parameter[0], parameter[1]));
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
            generateMethod.call(this, parameter);
        }, this);
    },

    /**
     * @param {{path: String, method: String}} input
     * @param {{id: String, parameters: ?Object.<String>}} output
     */
    _checkMatchRoute: function (input, output) {
        var matchers = this._router.match(input);
        if (output === null) {
            expect(matchers).to.be.null;
            return;
        }

        expect(matchers).not.to.be.null;
        expect(matchers.id).to.equal(output.id);

        if (output.parameters) {
            for (var key in output.parameters) {
                if (output.parameters.hasOwnProperty(key)) {
                    expect(output.parameters[key]).to.equal(matchers.parameters[key]);
                }
            }
        }
    },

    /**
     * @param {{id: String, parameters: ?Object.<String>}} input
     * @param {?String} output
     */
    _checkGenerateRoute: function (input, output) {
        try {
            expect(this._router.generate(input.id, input.parameters)).to.equal(output);
        } catch (e) {
            if (e.name === 'AssertionError') {
                throw e;
            } else {
                expect(output).to.be.undefined;
            }
        }
    }
});

module.exports = new RouterBaseTest;
