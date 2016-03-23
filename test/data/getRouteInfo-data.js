module.exports = [
    [
        'simplest_route',
        {
            id: "simplest_route",
            path: "/a/route",
            pattern: /^\/a\/route$/,
            host: undefined,
            hostPattern: /.*/,
            defaults: {},
            hostParameters: [],
            methods: [
                "GET",
                "POST",
                "PUT",
                "DELETE"
            ],
            parameters: [],
            requirements: {},
            schemes: [
                "http",
                "https"
            ],
            definition: {
                id: "simplest_route",
                path: "/a/route",
                host: undefined,
                defaults: {},
                methods: [
                    "GET",
                    "POST",
                    "PUT",
                    "DELETE"
                ],
                requirements: {},
                schemes: [
                    "http",
                    "https"
                ]
            }
        }
    ],
    [
        'route_with_required_parameter',
        {
            id: "route_with_required_parameter",
            path: "/c/{parameter}",
            pattern: /^\/c\/([^\/.]*)$/,
            host: undefined,
            defaults: {
                action: "defaultAction"
            },
            hostParameters: [],
            hostPattern: /.*/,
            methods: [
                "GET",
                "POST"
            ],
            parameters: [
                "parameter"
            ],
            requirements: {},
            schemes: [
                "http",
                "https"
            ],
            definition: {
                id: "route_with_required_parameter",
                path: "/c/{parameter}",
                host: undefined,
                defaults: {
                    action: "defaultAction"
                },
                methods: [
                    "GET",
                    "POST"
                ],
                requirements: {},
                schemes: [
                    "http",
                    "https"
                ]
            }
        }
    ],
    [
        'route_with_host',
        {
            id: "route_with_host",
            path: "/a",
            pattern: /^\/a$/,
            host: "{sub}.example.com",
            hostParameters: [
                "sub"
            ],
            hostPattern: /^(m|mobile)?\.example\.com$/,
            defaults: {
                sub: "m"
            },
            methods: [
                "GET",
                "POST",
                "PUT",
                "DELETE"
            ],
            parameters: [],
            requirements: {
                sub: /^m|mobile$/
            },
            schemes: [
                "http",
                "https"
            ],
            definition: {
                id: "route_with_host",
                path: "/a",
                host: "{sub}.example.com",
                defaults: {
                    sub: "m"
                },
                methods: [
                    "GET",
                    "POST",
                    "PUT",
                    "DELETE"
                ],
                requirements: {
                    sub: "m|mobile"
                },
                schemes: [
                    "http",
                    "https"
                ]
            }
        }
    ],
    [
        'prefixed_route_with_required_parameter',
        {
            id: 'prefixed_route_with_required_parameter',
            path: '/prefixed/c/{parameter}',
            defaults: {action: 'defaultAction'},
            methods: ['GET', 'POST'],
            host: undefined,
            hostParameters: [],
            hostPattern: /.*/,
            pattern: /^\/prefixed\/c\/([^\/.]*)$/,
            parameters: ['parameter'],
            requirements: {},
            schemes: [
                "http",
                "https"
            ],
            definition: {
                id: 'prefixed_route_with_required_parameter',
                path: '/prefixed/c/{parameter}',
                defaults: {action: 'defaultAction'},
                host: undefined,
                prefix: '/prefixed',
                methods: ['GET', 'POST'],
                requirements: {},
                schemes: [
                    "http",
                    "https"
                ]
            }
        }
    ],
    [
        'custom_property_route_without_delimiter',
        {
            id: "custom_property_route_without_delimiter",
            path: "/prefix/l/{parameter1}{parameter2}",
            pattern: /^\/prefix\/l\/(\d+)([a-z]+)$/,
            host: "example1.com",
            defaults: {},
            hostParameters: [],
            hostPattern: /^example1\.com$/,
            methods: [
                "GET",
                "POST",
                "PUT",
                "DELETE"
            ],
            parameters: [
                "parameter1",
                "parameter2"
            ],
            requirements: {
                parameter1: /^\d+$/,
                parameter2: /^[a-z]+$/
            },
            schemes: [
                "http",
                "https"
            ],
            definition: {
                id: "custom_property_route_without_delimiter",
                path: "/prefix/l/{parameter1}{parameter2}",
                host: "example1.com",
                customProperty: "customValue",
                defaults: {},
                methods: [
                    "GET",
                    "POST",
                    "PUT",
                    "DELETE"
                ],
                prefix: "/prefix",
                requirements: {
                    parameter1: "\\d+",
                    parameter2: "[a-z]+"
                },
                schemes: [
                    "http",
                    "https"
                ]
            }
        }
    ],
    [
        'route_that_not_exists'
    ]
];
