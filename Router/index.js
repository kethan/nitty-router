import { add, use } from '../src/utils'
export const Router = ({ routes = [], ...other } = {}) => ({
    __proto__: new Proxy({}, {
        get: (_, prop, receiver) => (route, ...handlers) =>
            ((prop = prop.toUpperCase?.()) === "USE" ?
        use(routes, route, handlers) :
        add(routes, prop, route, handlers, route),
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
