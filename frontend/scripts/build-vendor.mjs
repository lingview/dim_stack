// 共享依赖产物供index.html的importmap解析, 保证React单实例

import { build } from 'esbuild'
import { mkdirSync } from 'node:fs'

const vendorDir = 'public/vendor'
mkdirSync(vendorDir, { recursive: true })

const DEFINE = { 'process.env.NODE_ENV': '"production"' }
const TARGET = ['es2020']
const JSX = 'automatic'

const targets = [
    { name: 'react', external: [] },
    { name: 'react-dom', external: ['react'] },
    { name: 'react-dom-client', external: ['react', 'react-dom'] },
    { name: 'react-jsx-runtime', external: ['react'] },
    { name: 'react-router-dom', external: ['react', 'react-dom'] },
]

for (const t of targets) {
    await build({
        entryPoints: [`scripts/vendor-entries/${t.name}.js`],
        bundle: true,
        format: 'esm',
        platform: 'browser',
        target: TARGET,
        jsx: JSX,
        define: DEFINE,
        external: t.external,
        outfile: `${vendorDir}/${t.name}.js`,
        logLevel: 'error',
    })
    console.log(`vendor built: ${t.name}.js`)
}
