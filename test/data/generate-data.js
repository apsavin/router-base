var data = [
    [
        [
            {id: 'simplest_route'},
            '/a/route'
        ],
        [
            {id: 'simplest_route', parameters: {a: 1, b: 1}},
            '/a/route?a=1&b=1'
        ],
        [
            {id: 'simplest_route', parameters: {a: 1, b: 'sdf'}},
            '/a/route?a=1&b=sdf'
        ]
    ],
    [
        {id: 'simplest_route_with_default_parameter', parameters: {a: 1}},
        '/b/route?a=1'
    ],
    [
        [
            {id: 'route_with_required_parameter', parameters: {parameter: 1, a: 1}},
            '/c/1?a=1'
        ],
        [
            {id: 'route_with_required_parameter'}
        ]
    ],
    [
        [
            {id: 'route_with_not_required_parameter'},
            '/d'
        ],
        [
            {id: 'route_with_not_required_parameter', parameters: {a: 1}},
            '/d?a=1'
        ],
        [
            {id: 'route_with_not_required_parameter', parameters: {parameter: 1, a: 1}},
            '/d/1?a=1'
        ]
    ],
    [
        [
            {id: 'route_with_required_parameters', parameters: {parameter1: 1, parameter2: 2}},
            '/e/1/2'
        ],
        [
            {id: 'route_with_required_parameters'}
        ]
    ],
    [
        [
            {id: 'route_with_not_required_parameters'},
            '/f'
        ],
        [
            {id: 'route_with_not_required_parameters', parameters: {parameter2: 3}},
            '/f/1/3'
        ],
        [
            {id: 'route_with_not_required_parameters', parameters: {parameter1: 3}},
            '/f/3'
        ],
        [
            {id: 'route_with_not_required_parameters', parameters: {parameter1: 3, parameter2: 3}},
            '/f/3/3'
        ]
    ],
    [
        {id: 'bad_route_with_required_parameter_after_not_required_parameter', parameters: {parameter2: 2}},
        '/g/1/2'
    ],
    [
        [
            {id: 'route_with_point_as_parameters_delimiter', parameters: {parameter1: 'x'}},
            '/h/x'
        ],
        [
            {id: 'route_with_point_as_parameters_delimiter', parameters: {parameter1: 'x', parameter3: 'json'}},
            '/h/x/file.json'
        ],
        [
            {id: 'route_with_point_as_parameters_delimiter', parameters: {parameter1: 'x', parameter3: 'json', a: 'dsf'}},
            '/h/x/file.json?a=dsf'
        ]
    ],
    [
        [
            {id: 'route_with_required_string_parameter', parameters: {parameter: 'x'}},
            '/i/x'
        ],
        [
            {id: 'route_with_required_string_parameter', parameters: {parameter: 1}}
        ]
    ],
    [
        [
            {id: 'route_with_not_required_numeric_parameter'},
            '/k'
        ],
        [
            {id: 'route_with_not_required_numeric_parameter', parameters: {parameter: 5}},
            '/k/5'
        ],
        [
            {id: 'route_with_not_required_numeric_parameter', parameters: {parameter: 'x'}}
        ]
    ],
    [
        [
            {id: 'route_with_host'},
            'http://m.example.com/a'
        ],
        [
            {id: 'route_with_host', parameters: {sub: 'mobile'}},
            'http://mobile.example.com/a'
        ],
        [
            {id: 'route_with_host', parameters: {sub: 'zxc'}}
        ]
    ],
    [
        [
            {id: 'route_without_delimiter', parameters: {parameter1: 1, parameter2: 'x'}},
            '/l/1x'
        ],
        [
            {id: 'route_without_delimiter', parameters: {parameter1: 1, parameter2: '-'}}
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
                id: 'prefixed_' + data[0].id,
                parameters: data[0].parameters
            },
            data[1] ? !data[1].indexOf('http://') ? data[1].replace('.com', '.com/prefixed') : '/prefixed' + data[1] : data[1]
        ];
    }))
    .concat(data.map(function prefix (data) {
        var key;
        if (Array.isArray(data[0])) {
            return data.map(prefix);
        }
        var parametersWithEnLocale;
        if (data[0]) {
            var parameters = data[0].parameters;
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
                id: 'prefixed_with_locale_' + data[0].id,
                parameters: parametersWithEnLocale
            },
            data[1] ? !data[1].indexOf('http://') ? data[1].replace('.com', '.com/en') : '/en' + data[1] : data[1]
        ];
    }));
