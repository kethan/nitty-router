const
    compile = path => RegExp(`^${path
        .replace(/\/+(\/|$)/g, '$1')                        // strip double & trailing slash
        .replace(/(\/?\.?):(\w+)\+/g, '($1(?<$2>*))')       // greedy params
        .replace(/(\/?\.?):(\w+)/g, '($1(?<$2>[^$1/]+?))')  // named params and image format
        .replace(/\./g, '\\.')                              // dot in path
        .replace(/(\/?)\*/g, '($1.*)?')                     // wildcard
        }/*$`),
    mount = fn => fn.fetch || fn,
    lead = x => x.startsWith('/') ? x : '/' + x,
    add = (routes, method, route, handlers, path) => routes.push([method, compile(route), handlers.map(mount), path]),
    use = (routes, route, handlers) =>
        route === "/" ?
            add(routes, "ALL", "/", handlers, "/") :
            route?.call || route?.fetch ?
                add(routes, "ALL", '/*', [route, ...handlers], "/*") :
                handlers.forEach(handler =>
                    handler?.routes?.forEach(([method, , handles, path]) =>
                        add(routes, method, lead(route + path), handles, lead(route + path))));
export const IttyRouter = ({ routes = [], ...other } = {}) => ({
    __proto__: new Proxy({}, {
        get: (_, prop, receiver) => (route, ...handlers) =>
        (prop === "use" ?
            use(routes, route, handlers) :
            add(routes, prop.toUpperCase?.(), route, handlers, route),
            receiver)
    }),
    routes,
    ...other,
    fetch: async (request, ...args) => {
        let res, url = new URL(request.url), match, query = request.query = { __proto__: null };
        for (const [k, v] of url.searchParams) query[k] = query[k] ? ([]).concat(query[k], v) : v;
        for (let [method, route, handlers, _] of routes) {
            if ((method === request.method || method === "ALL") && (match = url.pathname.match(route))) {
                request.params = match.groups || {};
                request.route = _;
                for (let handler of handlers)
                    if ((res = await handler(request.proxy ?? request, ...args)) !== undefined) return res
            }
        }
    }
});