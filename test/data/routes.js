var cloneDeep = require('lodash.clonedeep');

/**
 * @type {Array.<RouteDefinition|RoutesDefinition>}
 */
var routes = [
    {
        id: 'simplest_route',
        path: '/a/route'
    },
    {
        id: 'simplest_route_with_default_parameter',
        path: '/b/route',
        defaults: {action: 'defaultAction'}
    },
    {
        id: 'route_with_required_parameter',
        path: '/c/{parameter}',
        defaults: {action: 'defaultAction'},
        methods: ['GET', 'POST']
    },
    {
        id: 'route_with_not_required_parameter',
        path: '/d/{parameter}',
        defaults: {parameter: 0}
    },
    {
        id: 'route_with_required_parameters',
        path: '/e/{parameter1}/{parameter2}'
    },
    {
        id: 'route_with_not_required_parameters',
        path: '/f/{parameter1}/{parameter2}',
        defaults: {action: 'defaultAction', parameter1: 1, parameter2: 2}
    },
    {
        id: 'bad_route_with_required_parameter_after_not_required_parameter',
        path: '/g/{parameter1}/{parameter2}',
        defaults: {action: 'defaultAction', parameter1: 1}
    },
    {
        id: 'route_with_point_as_parameters_delimiter',
        path: '/h/{parameter1}/{parameter2}.{parameter3}',
        defaults: {action: 'defaultAction', parameter2: 'file', parameter3: 'format'}
    },
    {
        id: 'route_with_required_string_parameter',
        path: '/i/{parameter}',
        defaults: {action: 'defaultAction'},
        requirements: {parameter: "[a-z]+"}
    },
    {
        id: 'route_with_not_required_numeric_parameter',
        path: '/k/{parameter}',
        defaults: {action: 'defaultAction', parameter: 0},
        requirements: {parameter: "\\d+"}
    },
    {
        id: 'route_with_host',
        path: '/a',
        host: '{sub}.example.com',
        defaults: {sub: 'm'},
        requirements: {sub: 'm|mobile'}
    },
    {
        id: 'route_without_delimiter',
        path: '/l/{parameter1}{parameter2}',
        requirements: {parameter1: "\\d+", parameter2: "[a-z]+"}
    }
];

routes.push(
    {
        prefix: '/prefixed',
        routes: routes.map(function (route) {
            /**
             * @type {RouteDefinition}
             */
            var clone = cloneDeep(route);
            clone.id = 'prefixed_' + route.id;
            return clone;
        })
    },
    {
        prefix: '/{locale}',
        routes: routes.map(function (route) {
            /**
             * @type {RouteDefinition}
             */
            var clone = cloneDeep(route);
            clone.id = 'prefixed_with_locale_' + route.id;
            return clone;
        }),
        requirements: {
            locale: 'en|ru'
        }
    });

module.exports = routes;
