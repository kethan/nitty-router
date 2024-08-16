import { add, use } from './utils';

export const IttyRouter = ({ routes = [], ...other } = {}) => ({
    __proto__: new Proxy({}, {
        get: (_, prop, receiver) => (route, ...handlers) =>
        ((prop = prop.toUpperCase?.()) === "USE" ?
            use(routes, route, handlers) :
            add(routes, prop, route, handlers, route),
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