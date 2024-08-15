## nitty-router

# Nitty Router Nesting based router without base, powered by itty-router.

[![tests](https://github.com/kethan/nitty-router/actions/workflows/node.js.yml/badge.svg)](https://github.com/kethan/nitty-router/actions/workflows/node.js.yml) [![Version](https://img.shields.io/npm/v/nitty-router.svg?color=success&style=flat-square)](https://www.npmjs.com/package/nitty-router)

IttyRouter [![Badge size](https://deno.bundlejs.com/badge?q=nitty-router&treeshake=[*]&config={"compression":"gzip"})](https://unpkg.com/nitty-router)

Router [![Badge size](https://deno.bundlejs.com/badge?q=nitty-router/Router&treeshake=[*]&config={"compression":"gzip"})](https://unpkg.com/nitty-router/Router)

AutoRouter [![Badge size](https://deno.bundlejs.com/badge?q=nitty-router/AutoRouter&treeshake=[*]&config={"compression":"gzip"})](https://unpkg.com/nitty-router/AutoRouter)

### For documentation please refer https://itty.dev/

### Use

Use similar to express js middleware function use

### Example

```js
const grandchild = Router()
	.get("/", (req) => req)
	.all("*", () => "not found grandchild");

const child = Router()
	.get("/", (req) => req.params.bar)
	.use("grandchild/:name", grandchild)
	.all("*", () => "not found child");

const parent = Router()
	.get("/", () => "parent")
	.use("child/:bar", child)
	.all("*", () => "not found parent");

parent
	.fetch({
		url: "http://localhost/child/kitten/grandchild/mitten",
		method: "GET",
	})
	.then(console.log)
	.catch(console.error);
```
