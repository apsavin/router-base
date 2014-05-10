(function (global) {

    /**
     * @param {Object} object
     * @param {Function} callback
     * @param {Object} [ctx]
     * @returns {Object}
     */
    var map = function (object, callback, ctx) {
        var copy = {};
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                copy[key] = callback.call(ctx, object[key], key, object);
            }
        }
        return copy;
    };

    /**
     * merges objects
     * @returns {{}}
     */
    var merge = function () {
        var result = {};
        Array.prototype.forEach.call(arguments, function (o) {
            for (var key in o) {
                if (o.hasOwnProperty(key)) {
                    result[key] = o[key];
                }
            }
        });
        return result;
    };

    /**
     * @typedef {Object} RouteDefinition
     * @property {String} id
     * @property {String} path
     * @property {Object.<String|Number>} [defaults]
     * @property {Object.<String>} [requirements]
     * @property {Object.<String>} [methods]
     */

    /**
     * @typedef {Object} RoutesDefinition
     * @property {String} [prefix]
     * @property {Array.<RouteDefinition|RoutesDefinition>} routes
     */

    /**
     * @typedef {Object} RouteDefinitionUnified
     * @property {String} id
     * @property {RegExp} pattern
     * @property {String} path
     * @property {Array.<String>} parameters
     * @property {Object.<String>} defaults
     * @property {Object.<String>} methods
     */

    /**
     * @typedef {Object} Route
     * @property {String} id
     * @property {Object.<String>} [parameters]
     */

    /**
     * @class RouterBase
     * @param {Object} options
     * @param {Array.<RouteDefinition|RoutesDefinition>} options.routes
     * @param {Array.<String>} [options.defaultMethods]
     * @param {Object} [options.symbols]
     * @param {String} [options.symbols.parametersDelimiters]
     * @param {String} [options.symbols.parameterStart]
     * @param {String} [options.symbols.parameterMatcher]
     * @param {String} [options.symbols.parameterEnd]
     */
    var RouterBase = function (options) {
        var symbols = options.symbols || {},
            paramsDelimiters = symbols.parametersDelimiters || '\\.|\\/',
            paramStart = symbols.parameterStart || '\\{',
            paramMatcher = symbols.parameterMatcher || '.*?',
            paramEnd = symbols.parameterEnd || '\\}';

        /**
         * @type {string}
         * @private
         */
        this._defaultParameterRequirement = symbols.defaultParameterRequirement || '[^\\/.]*';

        /**
         * @type {RegExp}
         * @private
         */
        this._paramsReplaceRegExp = new RegExp('(' + paramsDelimiters + ')' + paramStart +
            '(' + paramMatcher + ')' + paramEnd, 'g');

        /**
         * @type {Array.<String>}
         * @private
         */
        this._defaultMethods = options.defaultMethods || ['GET', 'POST', 'PUT', 'DELETE'];

        /**
         * @type {Array.<RouteDefinitionUnified>}
         * @private
         */
        this._routes = this._unifyRoutes(options.routes);
    };

    /**
     * @param {Array.<RouteDefinition|RoutesDefinition>} routes
     * @param {RouteDefinition} [parentRoute]
     * @returns {Array.<RouteDefinitionUnified>}
     * @private
     */
    RouterBase.prototype._unifyRoutes = function (routes, parentRoute) {
        var unifiedRoutes = [];
        routes.forEach(function (route) {
            unifiedRoutes = unifiedRoutes.concat(this._unifyRoute(route, parentRoute));
        }, this);
        return unifiedRoutes;
    };

    /**
     * @param {RouteDefinition|RoutesDefinition} route
     * @param {RouteDefinition} [parentRoute]
     * @returns {RouteDefinitionUnified|Array.<RouteDefinitionUnified>}
     * @private
     */
    RouterBase.prototype._unifyRoute = function (route, parentRoute) {
        if (route.routes) {
            return this._unifyRoutes(route.routes, route);
        } else {
            parentRoute = parentRoute || {};
            var defaults = map(merge(parentRoute.defaults, route.defaults), function (prop) {
                    return String(prop);
                }),
                path = parentRoute.prefix ? parentRoute.prefix + route.path : route.path,
                parsedPath = this._parsePath(path, merge(parentRoute.requirements, route.requirements), defaults);
            return {
                id: route.id,
                pattern: parsedPath.regexp,
                path: path,
                parameters: parsedPath.parameters,
                defaults: defaults,
                methods: route.methods || this._defaultMethods
            };
        }
    };

    /**
     * @param {String} path
     * @param {Object} [requirements]
     * @param {Object} [defaults]
     * @returns {{regexp: RegExp, parameters: Array.<String>}}
     * @private
     */
    RouterBase.prototype._parsePath = function (path, requirements, defaults) {
        var parameters = [],
            defaultParameterRequirement = this._defaultParameterRequirement,
            regexp = new RegExp('^' +
                path
                    .replace(/([\/\.\|])/g, '\\$1')
                    .replace(this._paramsReplaceRegExp, function (match, delimiter, parameterName) {
                        var optional = parameterName in defaults;
                        parameters.push(parameterName);
                        return delimiter + (optional ? '?' : '') +
                            '(' + (requirements[parameterName] ? requirements[parameterName] : defaultParameterRequirement) + ')' +
                            (optional ? '?' : '');
                    }) +
                '$');
        return {
            regexp: regexp,
            parameters: parameters
        };
    };

    /**
     * @param {{path: String, method: String}} request
     * @returns {?Route}
     * @public
     */
    RouterBase.prototype.match = function (request) {
        var routes = this._routes,
            route,
            execResult;
        for (var i = 0, l = routes.length; i < l; i++) {
            route = routes[i];
            execResult = route.pattern.exec(request.path);
            if (execResult && route.methods.indexOf(request.method) > -1) {
                execResult.shift();
                return {
                    id: route.id,
                    parameters: this._retrieveParameters(route, execResult)
                };
            }
        }
        return null;
    };

    /**
     * @param {RouteDefinitionUnified} route
     * @param {Array.<String>} parsedParameters
     * @returns {Object.<String>}
     * @private
     */
    RouterBase.prototype._retrieveParameters = function (route, parsedParameters) {
        var parameters = {};
        for (var key in route.defaults) {
            if (route.defaults.hasOwnProperty(key)) {
                parameters[key] = route.defaults[key];
            }
        }
        for (var i = 0, l = route.parameters.length; i < l; i++) {
            if (parsedParameters[i] === undefined) {
                break;
            }
            parameters[route.parameters[i]] = parsedParameters[i];
        }
        return parameters;
    };

    /**
     * @param {String} id
     * @param {Object.<String>} params
     * @returns {?String}
     * @public
     */
    RouterBase.prototype.generate = function (id, params) {
        var routes = this._routes,
            route;
        for (var i = 0, l = routes.length; i < l; i++) {
            route = routes[i];
            if (route.id === id) {
                return this._generate(route, params);
            }
        }
        return null;
    };

    /**
     * @param {RouteDefinitionUnified} route
     * @param {Object.<String>} params
     * @returns {?String}
     * @private
     */
    RouterBase.prototype._generate = function (route, params) {
        var path = route.path,
            defaults = route.defaults;
        var generatedPath = path.replace(this._paramsReplaceRegExp, function (match, delimiter, parameterName) {
            var optional = parameterName in defaults,
                exists = parameterName in params,
                value = params[parameterName];
            delete params[parameterName];
            if (exists) {
                return delimiter + value;
            } else if (!optional) {
                throw new Error('Parameter ' + parameterName + ' is needed for route ' + route.id + ' generation');
            }
            return '';
        });

        var query = '';

        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                query += key + '=' + params[key];
            }
        }

        if (query) {
            generatedPath += '?' + query;
        }

        return generatedPath;
    };

    /*global define: false, modules: false*/
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = RouterBase;
        }
    } else if (typeof define === 'function' && define.amd) {
        define('router-base', [], function () {
            return RouterBase;
        });
    } else if (typeof modules !== 'undefined' && modules.define) {
        modules.define('router-base', function (provide) {
            provide(RouterBase);
        });
    } else {
        global.RouterBase = RouterBase;
    }

})(this);
