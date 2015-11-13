var routes = require('./routes'),
    cloneDeep = require('lodash.clonedeep');

var data = [
    [
        [
            {path: '/a/route', method: 'GET'},
            {id: 'simplest_route', definition: routes[0]}
        ],
        [
            {path: '/a/route?param=value', method: 'GET'},
            {id: 'simplest_route', parameters: {param: 'value'}, definition: routes[0]}
        ],
        [
            {path: '/a/route?a=%D0%B0&b=%26', method: 'GET'},
            {id: 'simplest_route', parameters: {a: 'а', b: '&'}, definition: routes[0]}
        ],
        [
            {path: '/a/route', method: 'GET', scheme: 'http'},
            {id: 'simplest_route', definition: routes[0]}
        ],
        [
            {path: '/a/route', method: 'GET', scheme: 'ftp'},
            null
        ],
        [
            {path: '/a/rote', method: 'GET'},
            null
        ]
    ],
    [
        {path: '/b/route', method: 'GET'},
        {id: 'simplest_route_with_default_parameter', parameters: {action: 'defaultAction'}, definition: routes[1]}
    ],
    [
        [
            {path: '/c/5', method: 'GET'},
            {id: 'route_with_required_parameter', parameters: {action: 'defaultAction', parameter: '5'}, definition: routes[2]}
        ],
        [
            {path: '/c/5?d=6', method: 'GET'},
            {id: 'route_with_required_parameter', parameters: {action: 'defaultAction', parameter: '5', d: '6'}, definition: routes[2]}
        ],
        [
            {path: '/c/5?d=6&parameter=7', method: 'GET'},
            {id: 'route_with_required_parameter', parameters: {action: 'defaultAction', parameter: '5', d: '6'}, definition: routes[2]}
        ],
        [
            {path: '/c/5', method: 'POST'},
            {id: 'route_with_required_parameter', parameters: {action: 'defaultAction', parameter: '5'}, definition: routes[2]}
        ],
        [
            {path: '/c/5', method: 'PUT'},
            null
        ],
        [
            {path: '/c', method: 'GET'},
            null
        ]
    ],
    [
        [
            {path: '/d/5', method: 'GET'},
            {id: 'route_with_not_required_parameter', parameters: {parameter: '5'}, definition: routes[3]}
        ],
        [
            {path: '/d', method: 'GET'},
            {id: 'route_with_not_required_parameter', parameters: {parameter: '0'}, definition: routes[3]}
        ]
    ],
    [
        [
            {path: '/e/1/2', method: 'GET'},
            {id: 'route_with_required_parameters', parameters: {parameter1: '1', parameter2: '2'}, definition: routes[4]}
        ],
        [
            {path: '/e/a/b', method: 'GET'},
            {id: 'route_with_required_parameters', parameters: {parameter1: 'a', parameter2: 'b'}, definition: routes[4]}
        ],
        [
            {path: '/e/a', method: 'GET'},
            null
        ]
    ],
    [
        [
            {path: '/f/1/b', method: 'GET'},
            {id: 'route_with_not_required_parameters', parameters: {action: 'defaultAction', parameter1: '1', parameter2: 'b'}, definition: routes[5]}
        ],
        [
            {path: '/f/1', method: 'GET'},
            {id: 'route_with_not_required_parameters', parameters: {action: 'defaultAction', parameter1: '1', parameter2: '2'}, definition: routes[5]}
        ],
        [
            {path: '/f', method: 'GET'},
            {id: 'route_with_not_required_parameters', parameters: {action: 'defaultAction', parameter1: '1', parameter2: '2'}, definition: routes[5]}
        ],
        [
            {path: '/f/%D0%B0/%26', method: 'GET'},
            {id: 'route_with_not_required_parameters', parameters: {action: 'defaultAction', parameter1: 'а', parameter2: '&'}, definition: routes[5]}
        ]
    ],
    [
        {path: '/g/2/f', method: 'GET'},
        {id: 'bad_route_with_required_parameter_after_not_required_parameter', parameters: {action: 'defaultAction', parameter1: '2', parameter2: 'f'}, definition: routes[6]}
    ],
    [
        {path: '/h/p/file.html', method: 'GET'},
        {id: 'route_with_point_as_parameters_delimiter', parameters: {action: 'defaultAction', parameter1: 'p', parameter2: 'file', parameter3: 'html'}, definition: routes[7]}
    ],
    [
        [
            {path: '/i/asd', method: 'GET'},
            {id: 'route_with_required_string_parameter', parameters: {action: 'defaultAction', parameter: 'asd'}, definition: routes[8]}
        ],
        [
            {path: '/i', method: 'GET'},
            null
        ],
        [
            {path: '/i/5', method: 'GET'},
            null
        ]
    ],
    [
        [
            {path: '/k/3', method: 'GET'},
            { id: 'route_with_not_required_numeric_parameter', parameters: {action: 'defaultAction', parameter: '3'}, definition: routes[9]}
        ],
        [
            {path: '/k', method: 'GET'},
            { id: 'route_with_not_required_numeric_parameter', parameters: {action: 'defaultAction', parameter: '0'}, definition: routes[9]}
        ],
        [
            {path: '/k/sdf', method: 'GET'},
            null
        ]
    ],
    [
        [
            {path: '/a', method: 'GET', host: 'm.example.com'},
            {id: 'route_with_host', parameters: {sub: 'm'}, definition: routes[10]}
        ],
        [
            {path: '/a', method: 'GET'},
            null
        ],
        [
            {path: '/a', method: 'GET', host: 'null.example.com'},
            null
        ]
    ],
    [
        [
            {path: '/m', method: 'GET', host: 'm.example.com'},
            {id: 'route_with_host_without_defaults', parameters: {sub: 'm'}, definition: routes[11]}
        ],
        [
            {path: '/m', method: 'GET'},
            null
        ],
        [
            {path: '/m', method: 'GET', host: 'null.example.com'},
            null
        ]
    ],
    [
        [
            {path: '/l/1x', method: 'GET'},
            {id: 'route_without_delimiter', parameters: {parameter1: '1', parameter2: 'x'}, definition: routes[12]}
        ],
        [
            {path: '/l/1-', method: 'GET'},
            null
        ]
    ]
];

module.exports = data
    .concat(data.map(function createDataForRoutesWithPrefix (data) {
        if (Array.isArray(data[0])) {
            return data.map(createDataForRoutesWithPrefix);
        }

        var input = cloneDeep(data[0]),
            output = null,
            prefix = '/prefixed';

        input.path = prefix + data[0].path;
        if (data[1]) {
            output = cloneDeep(data[1]);
            output.id = output.definition.id = 'prefixed_' + data[1].id;
            output.definition.prefix = prefix;
            output.definition.path = prefix + output.definition.path;
        }

        return [
            input,
            output
        ];
    }))
    .concat(data.map(function createDataForRoutesWithLocale (data) {
        var key,
            definition,
            getDefinition = function (data) {
                var definition = cloneDeep(data.definition);
                definition.id = 'prefixed_with_locale_' + definition.id;
                definition.prefix = '/{locale}';
                definition.requirements = {
                    locale: 'en|ru'
                };
                definition.path = definition.prefix + definition.path;
                return definition;
            };
        if (Array.isArray(data[0])) {
            var prefixedData = data.map(createDataForRoutesWithLocale);

            var correctSample = prefixedData[0],
                correctSampleParameters = correctSample[1].parameters,
                parametersWithRuLocale = {};

            if (correctSample[1].definition && correctSample[1].definition.id.indexOf('prefixed_with_locale_') === 0){
                definition = correctSample[1].definition;
            } else {
                definition = getDefinition(correctSample[1]);
            }

            for (key in correctSampleParameters) {
                if (correctSampleParameters.hasOwnProperty(key)) {
                    parametersWithRuLocale[key] = correctSampleParameters[key];
                }
            }
            parametersWithRuLocale.locale = 'ru';
            prefixedData.push([
                {
                    path: correctSample[0].path.replace('/en/', '/ru/'),
                    method: correctSample[0].method,
                    scheme: correctSample[0].scheme,
                    host: correctSample[0].host
                },
                {
                    id: correctSample[1].id,
                    parameters: parametersWithRuLocale,
                    definition: definition
                }
            ]);
            prefixedData.push([
                {
                    path: correctSample[0].path.replace('/en/', '/null/'),
                    method: correctSample[0].method,
                    scheme: correctSample[0].scheme,
                    host: correctSample[0].host
                },
                null
            ]);

            return prefixedData;
        }
        var parametersWithEnLocale;
        if (data[1]) {
            var parameters = data[1].parameters;
            parametersWithEnLocale = {};
            for (key in parameters) {
                if (parameters.hasOwnProperty(key)) {
                    parametersWithEnLocale[key] = parameters[key];
                }
            }
            parametersWithEnLocale.locale = 'en';
        }
        return [
            {
                path: '/en' + data[0].path,
                method: data[0].method,
                scheme: data[0].scheme,
                host: data[0].host
            },
            data[1] ? {
                id: 'prefixed_with_locale_' + data[1].id,
                parameters: parametersWithEnLocale,
                definition: getDefinition(data[1])
            } : null
        ];
    }))
    .concat(data.map(function createDataForRoutesWithCustomProperty (data) {
        if (Array.isArray(data[0])) {
            return data.map(createDataForRoutesWithCustomProperty);
        }

        var input = cloneDeep(data[0]),
            output = null,
            prefix = '/prefix';

        input.path = prefix + data[0].path;
        input.host = data[0].host || 'example1.com';
        if (data[1]) {
            output = cloneDeep(data[1]);
            output.id = output.definition.id = 'custom_property_' + data[1].id;
            output.definition.prefix = prefix;
            output.definition.path = prefix + output.definition.path;
            output.definition.customProperty = 'customValue';
        }

        return [
            input,
            output
        ];
    }))
    .concat(data.map(function createDataForRoutesWithDoublePrefix (data) {
        if (Array.isArray(data[0])) {
            return data.map(createDataForRoutesWithDoublePrefix);
        }

        var input = cloneDeep(data[0]),
            output = null,
            prefix = '/first_prefix/second_prefix';

        input.path = prefix + data[0].path;
        if (data[1]) {
            output = cloneDeep(data[1]);
            output.id = output.definition.id = 'double_prefixed_' + data[1].id;
            output.definition.prefix = prefix;
            output.definition.path = prefix + output.definition.path;
        }

        return [
            input,
            output
        ];
    }));
