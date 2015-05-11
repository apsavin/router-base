var data = [
    [
        [
            {path: '/a/route', method: 'GET'},
            {id: 'simplest_route'}
        ],
        [
            {path: '/a/route?param=value', method: 'GET'},
            {id: 'simplest_route', parameters: {param: 'value'}}
        ],
        [
            {path: '/a/route', method: 'GET', scheme: 'http'},
            {id: 'simplest_route'}
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
        {id: 'simplest_route_with_default_parameter', parameters: {action: 'defaultAction'}}
    ],
    [
        [
            {path: '/c/5', method: 'GET'},
            {id: 'route_with_required_parameter', parameters: {action: 'defaultAction', parameter: 5}}
        ],
        [
            {path: '/c/5?d=6', method: 'GET'},
            {id: 'route_with_required_parameter', parameters: {action: 'defaultAction', parameter: 5, d: 6}}
        ],
        [
            {path: '/c/5?d=6&parameter=7', method: 'GET'},
            {id: 'route_with_required_parameter', parameters: {action: 'defaultAction', parameter: 5, d: 6}}
        ],
        [
            {path: '/c/5', method: 'POST'},
            {id: 'route_with_required_parameter', parameters: {action: 'defaultAction', parameter: 5}}
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
            {id: 'route_with_not_required_parameter', parameters: {parameter: 5}}
        ],
        [
            {path: '/d', method: 'GET'},
            {id: 'route_with_not_required_parameter', parameters: {parameter: 0}}
        ]
    ],
    [
        [
            {path: '/e/1/2', method: 'GET'},
            {id: 'route_with_required_parameters', parameters: {parameter1: 1, parameter2: 2}}
        ],
        [
            {path: '/e/a/b', method: 'GET'},
            {id: 'route_with_required_parameters', parameters: {parameter1: 'a', parameter2: 'b'}}
        ],
        [
            {path: '/e/a', method: 'GET'},
            null
        ]
    ],
    [
        [
            {path: '/f/1/b', method: 'GET'},
            {id: 'route_with_not_required_parameters', parameters: {action: 'defaultAction', parameter1: 1, parameter2: 'b'}}
        ],
        [
            {path: '/f/1', method: 'GET'},
            {id: 'route_with_not_required_parameters', parameters: {action: 'defaultAction', parameter1: 1, parameter2: 2}}
        ],
        [
            {path: '/f', method: 'GET'},
            {id: 'route_with_not_required_parameters', parameters: {action: 'defaultAction', parameter1: 1, parameter2: 2}}
        ]
    ],
    [
        {path: '/g/2/f', method: 'GET'},
        {id: 'bad_route_with_required_parameter_after_not_required_parameter', parameters: {action: 'defaultAction', parameter1: 2, parameter2: 'f'}}
    ],
    [
        {path: '/h/p/file.html', method: 'GET'},
        {id: 'route_with_point_as_parameters_delimiter', parameters: {action: 'defaultAction', parameter1: 'p', parameter2: 'file', parameter3: 'html'}}
    ],
    [
        [
            {path: '/i/asd', method: 'GET'},
            {id: 'route_with_required_string_parameter', parameters: {action: 'defaultAction', parameter: 'asd'}}
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
            { id: 'route_with_not_required_numeric_parameter', parameters: {action: 'defaultAction', parameter: 3}}
        ],
        [
            {path: '/k', method: 'GET'},
            { id: 'route_with_not_required_numeric_parameter', parameters: {action: 'defaultAction', parameter: 0}}
        ],
        [
            {path: '/k/sdf', method: 'GET'},
            null
        ]
    ],
    [
        [
            {path: '/a', method: 'GET', host: 'm.example.com'},
            {id: 'route_with_host', parameters: {sub: 'm'}}
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
            {path: '/l/1x', method: 'GET'},
            {id: 'route_without_delimiter', parameters: {parameter1: '1', parameter2: 'x'}}
        ],
        [
            {path: '/l/1-', method: 'GET'},
            null
        ]
    ]
];

module.exports = data
    .concat(data.map(function prefix (data) {
        if (Array.isArray(data[0])) {
            return data.map(prefix);
        }
        return [
            {
                path: '/prefixed' + data[0].path,
                method: data[0].method,
                scheme: data[0].scheme,
                host: data[0].host
            },
            data[1] ? {
                id: 'prefixed_' + data[1].id,
                parameters: data[1].parameters
            } : null
        ];
    }))
    .concat(data.map(function prefix (data) {
        var key;
        if (Array.isArray(data[0])) {
            var prefixedData = data.map(prefix);

            var correctSample = prefixedData[0],
                correctSampleParameters = correctSample[1].parameters,
                parametersWithRuLocale = {};

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
                    parameters: parametersWithRuLocale
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
                parameters: parametersWithEnLocale
            } : null
        ];
    }));
