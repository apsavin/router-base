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
     * @property {String} [host]
     * @property {Object.<String|Number>} [defaults]
     * @property {Object.<String>} [requirements]
     * @property {Array.<String>} [methods]
     * @property {Array.<String>} [schemes]
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
     * @property {RegExp} hostPattern
     * @property {String} host
     * @property {Array.<String>} hostParameters
     * @property {Object.<RegExp>} requirements
     * @property {Object.<String>} defaults
     * @property {Array.<String>} methods
     * @property {Array.<String>} schemes
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
     * @param {Array.<String>} [options.defaultSchemes]
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
         * @const {{regexp: RegExp, parameters: Array}}
         * @private
         */
        this._NO_HOST = {
            regexp: /.*/,
            parameters: []
        };

        /**
         * @type {string}
         * @private
         */
        this._defaultParameterRequirement = symbols.defaultParameterRequirement || '[^\\/.]*';

        /**
         * @type {RegExp}
         * @private
         */
        this._paramsReplaceRegExp = new RegExp('(' + paramsDelimiters + ')?' + paramStart +
            '(' + paramMatcher + ')' + paramEnd, 'g');

        /**
         * @type {Array.<String>}
         * @private
         */
        this._defaultMethods = options.defaultMethods || ['GET', 'POST', 'PUT', 'DELETE'];

        /**
         * @type {Array.<String>}
         * @private
         */
        this._defaultSchemes = options.defaultSchemes || ['http', 'https'];

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
                requirements = merge(parentRoute.requirements, route.requirements),
                path = parentRoute.prefix ? parentRoute.prefix + route.path : route.path,
                host = route.host || parentRoute.host,
                parsedHost = host ? this._parsePath(host, requirements, defaults) : this._NO_HOST,
                parsedPath = this._parsePath(path, requirements, defaults);
            return {
                id: route.id,
                pattern: parsedPath.regexp,
                path: path,
                parameters: parsedPath.parameters,
                hostPattern: parsedHost.regexp,
                host: host,
                hostParameters: parsedHost.parameters,
                requirements: map(requirements, function (prop) {
                    return new RegExp('^' + prop + '$');
                }),
                defaults: defaults,
                methods: route.methods || parentRoute.methods || this._defaultMethods,
                schemes: route.schemes || parentRoute.schemes || this._defaultSchemes
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
                        return (delimiter || '') + (optional && delimiter ? '?' : '') +
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
     * @param {{path: String, method: String, host: String|undefined, scheme: String|undefined}} request
     * @returns {?Route}
     * @public
     */
    RouterBase.prototype.match = function (request) {
        var routes = this._routes,
            route,
            pathParts = request.path.split('?'),
            path = pathParts[0],
            query = pathParts[1] ? this._parseQuery(pathParts[1]) : null,
            execPathResult,
            execHostResult,
            isMethodValid,
            isSchemeValid;
        for (var i = 0, l = routes.length; i < l; i++) {
            route = routes[i];
            execPathResult = route.pattern.exec(path);
            if (!execPathResult) {
                continue;
            }
            execHostResult = route.hostPattern.exec(request.host);
            if (!execHostResult) {
                continue;
            }
            isMethodValid = route.methods.indexOf(request.method) > -1;
            if (!isMethodValid) {
                continue;
            }
            isSchemeValid = !request.scheme || route.schemes.indexOf(request.scheme) > -1;
            if (isSchemeValid) {
                execPathResult.shift();
                execHostResult.shift();
                return {
                    id: route.id,
                    parameters: this._retrieveParameters(route, execPathResult, execHostResult, query)
                };
            }
        }
        return null;
    };

    /**
     * @param {String} query
     * @returns {{}}
     * @private
     */
    RouterBase.prototype._parseQuery = function (query) {
        var obj = {};

        if (typeof query !== 'string' || query.length === 0) {
            return obj;
        }

        var regexp = /\+/g;
        query = query.split('&');

        var len = query.length;

        for (var i = 0; i < len; ++i) {
            var x = query[i].replace(regexp, '%20'),
                idx = x.indexOf('='),
                kstr, vstr, k, v;

            if (idx >= 0) {
                kstr = x.substr(0, idx);
                vstr = x.substr(idx + 1);
            } else {
                kstr = x;
                vstr = '';
            }

            k = decodeURIComponent(kstr);
            v = decodeURIComponent(vstr);

            if (!obj.hasOwnProperty(k)) {
                obj[k] = v;
            } else if (Array.isArray(obj[k])) {
                obj[k].push(v);
            } else {
                obj[k] = [obj[k], v];
            }
        }

        return obj;
    };

    /**
     * @param {RouteDefinitionUnified} route
     * @param {Array.<String>} parsedParameters
     * @param {Array.<String>} parsedHostParameters
     * @param {Object.<String>} [query={}]
     * @returns {Object.<String>}
     * @private
     */
    RouterBase.prototype._retrieveParameters = function (route, parsedParameters, parsedHostParameters, query) {
        var parameters = query || {};
        for (var key in route.defaults) {
            if (route.defaults.hasOwnProperty(key)) {
                parameters[key] = route.defaults[key];
            }
        }
        this._extendParameters(parsedParameters, route.parameters, parameters);
        this._extendParameters(parsedHostParameters, route.hostParameters, parameters);
        return parameters;
    };

    /**
     * @param {Array.<String>} input parameters values
     * @param {Array.<String>} names parameters names
     * @param {Object.<String>} output parameters names: parameters values
     * @private
     */
    RouterBase.prototype._extendParameters = function (input, names, output) {
        for (var i = 0, l = names.length; i < l; i++) {
            if (input[i] === undefined) {
                break;
            }
            output[names[i]] = input[i];
        }
    };

    /**
     * @param {String} id
     * @param {Object.<String>} [params]
     * @returns {String}
     * @throws Error if required parameter is not given
     * @throws Error if parameter value is not suits requirements
     * @throws Error if route is not defined
     * @public
     */
    RouterBase.prototype.generate = function (id, params) {
        var routes = this._routes,
            route;
        for (var i = 0, l = routes.length; i < l; i++) {
            route = routes[i];
            if (route.id === id) {
                return this._generate(route, merge({}, params));
            }
        }
        throw new Error('No such route: ' + id);
    };

    /**
     * @param {RouteDefinitionUnified} route
     * @param {Object.<String>} [params]
     * @returns {String}
     * @throws Error if required parameter is not given
     * @throws Error if parameter value is not suits requirements
     * @private
     */
    RouterBase.prototype._generate = function (route, params) {
        var path = route.path,
            generatedPath,
            host = route.host,
            generatedHost,
            defaults = route.defaults,
            requirements = route.requirements,
            _this = this;
        generatedPath = path.replace(this._paramsReplaceRegExp, function (match, delimiter, parameterName) {
            var optional = parameterName in defaults,
                exists = params && parameterName in params;
            if (exists) {
                return _this._getParameterValue(parameterName, params, requirements, delimiter);
            } else if (!optional) {
                _this._throwParameterNeededError(parameterName, route.id);
            }

            var hasFilledParams = false;
            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    if (route.parameters.indexOf(key) > -1) {
                        hasFilledParams = true;
                        break;
                    }
                }
            }

            return hasFilledParams ? delimiter + defaults[parameterName] : '';
        });

        if (host) {
            generatedHost = host.replace(this._paramsReplaceRegExp, function (match, delimiter, parameterName) {
                var optional = parameterName in defaults,
                    exists = params && parameterName in params;
                delimiter = delimiter || '';
                if (exists) {
                    return _this._getParameterValue(parameterName, params, requirements, delimiter);
                } else if (optional) {
                    return delimiter + defaults[parameterName];
                } else {
                    _this._throwParameterNeededError(parameterName, route.id);
                }
            });
        }

        var query = '';

        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                query += (query.length ? '&' : '') + key + '=' + params[key];
            }
        }

        if (query) {
            generatedPath += '?' + query;
        }

        return generatedHost ? route.schemes[0] + '://' + generatedHost + generatedPath : generatedPath;
    };

    /**
     * @param {String} parameterName
     * @param {Object.<String>} params
     * @param {Object.<RegExp>} requirements
     * @param {String} delimiter
     * @returns {String}
     * @throws Error if parameter value is invalid
     * @private
     */
    RouterBase.prototype._getParameterValue = function (parameterName, params, requirements, delimiter) {
        var value = params[parameterName];
        delete params[parameterName];
        if (requirements[parameterName] && !requirements[parameterName].test(value)) {
            throw new Error('Parameter "' + parameterName + '" has bad value "' + value + '", not suitable for path generation');
        }
        return delimiter + value;
    };

    /**
     * @param {String} parameterName
     * @param {String} routeId
     * @private
     */
    RouterBase.prototype._throwParameterNeededError = function (parameterName, routeId) {
        throw new Error('Parameter "' + parameterName + '" is needed for route "' + routeId + '" generation');
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
