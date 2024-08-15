import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import bundleSize from 'rollup-plugin-bundle-size'


const resolvePkg = (pkg, input = "src/index", output = "dist/index") => ({
	input: `${input}.js`,
	plugins: [
		resolve(),
        bundleSize()
	],
	output: [
		{
			file: `${output}.es.js`,
			format: 'es',
		},
		{
			file: `${output}.cjs`,
			format: 'cjs',
		},
		{
			file: `${output}.min.js`,
			format: 'iife',
			name: pkg,
			strict: false,
			compact: true,
			plugins: [terser()]
		},
		{
			file: `${output}.umd.js`,
			format: 'umd',
			name: pkg,
			strict: false,
			compact: true,
			plugins: [terser()]
		}
	]
});

export default [
	resolvePkg("router"),
	resolvePkg("router", "IttyRouter/index", "IttyRouter/dist/index"),
	resolvePkg("router", "Router/index", "Router/dist/index"),
	resolvePkg("router", "AutoRouter/index", "AutoRouter/dist/index"),
]