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
                    handler?.routes ? handler?.routes?.forEach(([method, , handles, path]) =>
                        add(routes, method, lead(route + path), handles, lead(route + path)))
                        : add(routes, 'ALL', lead(route), [handler], lead(route))
                ),
    props = (routes, method, route, handlers) => ((method = method.toUpperCase?.()) === "USE" ?
        use(routes, route, handlers) :
        add(routes, method, route, handlers, route)),
    nest = (compile) => (routes, basePath = '') =>
        routes.flatMap(([method, , handlers, path]) => {
            const lead = x => (x.startsWith('/') || x.startsWith('*')) ? x : '/' + x;
            const fullPath = `${(basePath)}${lead(path)}`.replace(/\/+\//g, '/')
            const [fns, nested] = handlers?.map ?
                [handlers.filter(f => !f?.routes), handlers.find(f => f?.routes)?.routes] :
                [[], handlers?.routes]
            return [
                ...(fns.length ? [[method, compile(fullPath), fns, fullPath]] : []),
                ...(nested ? nest(compile)(nested, fullPath) : [])
            ];
        });


export {
    compile,
    mount,
    lead,
    add,
    use,
    nest,
    props
}