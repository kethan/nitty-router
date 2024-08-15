const
    compile = (path) => RegExp(`^${path
        .replace(/\/+(\/|$)/g, '$1')                       // strip double & trailing splash
        .replace(/(\/?\.?):(\w+)\+/g, '($1(?<$2>*))')       // greedy params
        .replace(/(\/?\.?):(\w+)/g, '($1(?<$2>[^$1/]+?))')  // named params and image format
        .replace(/\./g, '\\.')                              // dot in path
        .replace(/(\/?)\*/g, '($1.*)?')
        }/*$`),
    mount = (fn) => fn.fetch || fn,
    lead = x => x.startsWith('/') ? x : '/' + x,
    add = (routes, method, route, handlers, path) =>
        routes.push([method, compile(route), handlers.map(mount), path]),
    use = (routes, route, handlers) =>
        route === "/" ?
            add(routes, "ALL", "/", handlers, "/") :
            route?.call || route?.fetch ?
                add(routes, "ALL", '/*', [route, ...handlers], "/*") :
                handlers.forEach(handler =>
                    handler?.routes?.forEach(([method, , handles, path]) =>
                        add(routes, method, lead(route + path), handles, lead(route + path))));
export const Router = ({ routes = [], ...other } = {}) => ({
    __proto__: new Proxy({}, {
        get: (_, prop, receiver) => (route, ...handlers) =>
            (prop.toUpperCase() === "USE" ?
        use(routes, route, handlers) :
        add(routes, prop.toUpperCase?.(), route, handlers, route),
        receiver)
    }),
    routes,
    ...other,
    async fetch(request, ...args) {
        let url = new URL(request.url), match, response, query = request.query = { __proto__: null };
        for (const [k, v] of url.searchParams) query[k] = query[k] ? ([]).concat(query[k], v) : v;
        t: try {
            for (let handler of other.before || [])
                if ((response = await handler(request.proxy ?? request, ...args)) != null) break t

            // 2. then test routes
            outer: for (let [method, regex, handlers, path] of routes)
                if ((method == request.method || method == 'ALL') && (match = url.pathname.match(regex))) {
                    request.params = match.groups || {}                                     // embed params in request
                    request.route = path                                                    // embed route path in request

                    for (let handler of handlers)
                        if ((response = await handler(request.proxy ?? request, ...args)) != null) break outer
                }
        } catch (err) {
            if (!other.catch) throw err
            response = await other.catch(err, request.proxy ?? request, ...args)
        }

        try {
            for (let handler of other.finally || [])
                response = await handler(response, request.proxy ?? request, ...args) ?? response
        } catch (err) {
            if (!other.catch) throw err
            response = await other.catch(err, request.proxy ?? request, ...args)
        }

        return response;
    }
});
