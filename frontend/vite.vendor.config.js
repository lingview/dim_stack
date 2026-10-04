import { defineConfig, esmExternalRequirePlugin } from 'vite'
import { resolve } from 'node:path'

const wrapper = (file) => resolve(process.cwd(), 'scripts/vendor-entries', file)

const TARGETS = {
    react: { entry: { react: wrapper('react.js') }, external: [] },
    'react-dom': { entry: { 'react-dom': wrapper('react-dom.js') }, external: ['react'] },
    'react-dom-client': { entry: { 'react-dom-client': wrapper('react-dom-client.js') }, external: ['react', 'react-dom'] },
    'react-jsx-runtime': { entry: { 'react-jsx-runtime': wrapper('react-jsx-runtime.js') }, external: ['react'] },
    'react-router-dom': { entry: { 'react-router-dom': wrapper('react-router-dom.js') }, external: ['react', 'react-dom'] },
}

export default defineConfig(({ mode }) => {
    const target = TARGETS[mode] || TARGETS.react
    return {
        define: { 'process.env.NODE_ENV': '"production"' },
        build: {
            outDir: 'public/vendor',
            emptyOutDir: mode === 'react',
            lib: {
                entry: target.entry,
                formats: ['es'],
            },
            rollupOptions: {
                plugins: [esmExternalRequirePlugin({ external: target.external })],
                output: { entryFileNames: '[name].js' },
            },
            minify: false,
        },
    }
})
